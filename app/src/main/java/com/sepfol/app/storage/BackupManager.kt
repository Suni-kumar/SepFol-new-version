package com.sepfol.app.storage

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

class BackupManager(private val context: Context) {

    suspend fun createWorkspaceBackup(
        sourceFolder: File,
        destinationZip: File,
        onProgress: (String) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            if (destinationZip.exists()) destinationZip.delete()
            ZipOutputStream(BufferedOutputStream(FileOutputStream(destinationZip))).use { zipOut ->
                zipFolderRecursive(sourceFolder, sourceFolder.absolutePath, zipOut, onProgress)
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun zipFolderRecursive(
        file: File,
        basePath: String,
        zipOut: ZipOutputStream,
        onProgress: (String) -> Unit
    ) {
        val files = file.listFiles() ?: return
        val buffer = ByteArray(8192)

        for (curFile in files) {
            if (curFile.isDirectory) {
                zipFolderRecursive(curFile, basePath, zipOut, onProgress)
            } else {
                val relativePath = curFile.absolutePath.substring(basePath.length + 1)
                onProgress(curFile.name)
                FileInputStream(curFile).use { fi ->
                    BufferedInputStream(fi, 8192).use { origin ->
                        val entry = ZipEntry(relativePath)
                        zipOut.putNextEntry(entry)
                        var count: Int
                        while (origin.read(buffer, 0, 8192).also { count = it } != -1) {
                            zipOut.write(buffer, 0, count)
                        }
                        zipOut.closeEntry()
                    }
                }
            }
        }
    }

    suspend fun restoreWorkspaceBackup(
        zipFile: File,
        targetFolder: File,
        onProgress: (String) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            if (!targetFolder.exists()) targetFolder.mkdirs()
            val buffer = ByteArray(8192)
            ZipInputStream(BufferedInputStream(FileInputStream(zipFile))).use { zis ->
                var entry: ZipEntry? = zis.nextEntry
                while (entry != null) {
                    val newFile = File(targetFolder, entry.name)
                    onProgress(entry.name)
                    if (entry.isDirectory) {
                        newFile.mkdirs()
                    } else {
                        newFile.parentFile?.mkdirs()
                        FileOutputStream(newFile).use { fos ->
                            var count: Int
                            while (zis.read(buffer).also { count = it } != -1) {
                                fos.write(buffer, 0, count)
                            }
                        }
                    }
                    zis.closeEntry()
                    entry = zis.nextEntry
                }
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
