package com.sepfol.app.storage

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

data class VaultItem(
    val file: File,
    val name: String,
    val isDirectory: Boolean,
    val sizeBytes: Long,
    val itemCount: Int = 0,
    val lastModified: Long,
    val extension: String
)

class StorageManager(private val context: Context) {

    fun getVaultRoot(): File {
        val root = File(context.filesDir, "SepFolDataVault")
        if (!root.exists()) root.mkdirs()
        return root
    }

    fun getItemsInDirectory(directory: File): List<VaultItem> {
        val files = directory.listFiles() ?: return emptyList()
        return files.map { file ->
            val isDir = file.isDirectory
            val count = if (isDir) file.listFiles()?.size ?: 0 else 0
            VaultItem(
                file = file,
                name = file.name,
                isDirectory = isDir,
                sizeBytes = if (isDir) 0L else file.length(),
                itemCount = count,
                lastModified = file.lastModified(),
                extension = file.extension.lowercase()
            )
        }.sortedWith(compareByDescending<VaultItem> { it.isDirectory }.thenBy { it.name.lowercase() })
    }

    fun createFolder(parent: File, folderName: String): Boolean {
        val newFolder = File(parent, folderName.trim())
        return if (!newFolder.exists()) newFolder.mkdirs() else false
    }

    fun importUri(parent: File, uri: Uri, targetName: String): Boolean {
        return try {
            val destFile = File(parent, targetName)
            val inputStream: InputStream? = context.contentResolver.openInputStream(uri)
            val outputStream = FileOutputStream(destFile)
            inputStream?.use { input ->
                outputStream.use { output ->
                    input.copyTo(output, bufferSize = 8192)
                }
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun deleteItem(file: File): Boolean {
        return if (file.isDirectory) file.deleteRecursively() else file.delete()
    }

    fun renameItem(file: File, newName: String): Boolean {
        val dest = File(file.parentFile, newName.trim())
        return if (!dest.exists()) file.renameTo(dest) else false
    }
}
