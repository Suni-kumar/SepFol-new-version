package com.sepfol.app.folder

import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.DriveFileRenameOutline
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sepfol.app.components.CreateBadgeDialog
import com.sepfol.app.components.SettingsDialog
import com.sepfol.app.components.SimpleInputDialog
import com.sepfol.app.components.SlideMenuPanel
import com.sepfol.app.components.VaultFilterMode
import com.sepfol.app.storage.MetadataManager
import com.sepfol.app.storage.StorageManager
import com.sepfol.app.storage.VaultItem
import com.sepfol.app.theme.GlassBox
import com.sepfol.app.theme.SepFolTheme
import com.sepfol.app.viewer.InternalImageViewer
import com.sepfol.app.viewer.InternalPdfViewer
import java.io.File

@Composable
fun FolderScreen(
    currentTheme: SepFolTheme,
    onThemeChange: (SepFolTheme) -> Unit
) {
    val context = LocalContext.current
    val storageManager = remember { StorageManager(context) }
    val metadataManager = remember { MetadataManager(context) }

    var currentDir by remember { mutableStateOf(storageManager.getVaultRoot()) }
    var items by remember { mutableStateOf<List<VaultItem>>(emptyList()) }
    var searchQuery by remember { mutableStateOf("") }
    var isSearchExpanded by remember { mutableStateOf(false) }

    var filterMode by remember { mutableStateOf(VaultFilterMode.ALL) }
    var selectedBadgeId by remember { mutableStateOf<String?>(null) }
    var isDrawerOpen by remember { mutableStateOf(false) }
    var isSettingsOpen by remember { mutableStateOf(false) }
    var isCreateBadgeOpen by remember { mutableStateOf(false) }
    var isCreateFolderOpen by remember { mutableStateOf(false) }
    var renameTarget by remember { mutableStateOf<VaultItem?>(null) }

    var gridColumns by remember { mutableIntStateOf(2) }
    val selectedItems = remember { mutableStateOf(setOf<VaultItem>()) }
    val isSelectionMode = selectedItems.value.isNotEmpty()

    var activeViewerFile by remember { mutableStateOf<File?>(null) }

    fun refresh() {
        items = storageManager.getItemsInDirectory(currentDir)
        selectedItems.value = emptySet()
    }

    LaunchedEffect(currentDir) { refresh() }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            val fileName = "doc_${System.currentTimeMillis()}"
            storageManager.importUri(currentDir, it, fileName)
            refresh()
        }
    }

    BackHandler(enabled = activeViewerFile != null || isSelectionMode || currentDir != storageManager.getVaultRoot()) {
        when {
            activeViewerFile != null -> activeViewerFile = null
            isSelectionMode -> selectedItems.value = emptySet()
            currentDir != storageManager.getVaultRoot() -> currentDir = currentDir.parentFile ?: storageManager.getVaultRoot()
        }
    }

    if (activeViewerFile != null) {
        val file = activeViewerFile!!
        if (file.extension.equals("pdf", ignoreCase = true)) {
            InternalPdfViewer(file = file, onBack = { activeViewerFile = null })
        } else {
            InternalImageViewer(file = file, onBack = { activeViewerFile = null })
        }
        return
    }

    val filteredList = items.filter { item ->
        val matchesSearch = item.name.contains(searchQuery, ignoreCase = true)
        val starred = metadataManager.getStarredPaths().contains(item.file.absolutePath)
        val matchesFilter = when (filterMode) {
            VaultFilterMode.ALL -> true
            VaultFilterMode.STARRED -> starred
            VaultFilterMode.BADGE -> true
        }
        matchesSearch && matchesFilter
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF07060B))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 40.dp, start = 16.dp, end = 16.dp, bottom = 10.dp)
                    .pointerInput(Unit) {
                        detectHorizontalDragGestures { _, dragAmount ->
                            if (dragAmount < -20f) isSearchExpanded = true
                            else if (dragAmount > 20f && searchQuery.isEmpty()) isSearchExpanded = false
                        }
                    }
            ) {
                if (isSelectionMode) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { selectedItems.value = emptySet() }) {
                                Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                            }
                            Text("${selectedItems.value.size} Selected", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (selectedItems.value.size == 1) {
                                IconButton(onClick = { renameTarget = selectedItems.value.first() }) {
                                    Icon(Icons.Default.DriveFileRenameOutline, contentDescription = "Rename", tint = Color.White)
                                }
                            }
                            IconButton(onClick = {
                                selectedItems.value.forEach { storageManager.deleteItem(it.file) }
                                refresh()
                            }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFEF4444))
                            }
                        }
                    }
                } else if (isSearchExpanded) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search files & folders...", color = Color.White.copy(alpha = 0.4f)) },
                        trailingIcon = {
                            IconButton(onClick = { isSearchExpanded = false; searchQuery = "" }) {
                                Icon(Icons.Default.Close, contentDescription = "Close Search", tint = Color.White)
                            }
                        },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF8B5CF6),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
                            focusedContainerColor = Color(0xFF13111C),
                            unfocusedContainerColor = Color(0xFF13111C)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (currentDir != storageManager.getVaultRoot()) {
                                IconButton(onClick = { currentDir = currentDir.parentFile ?: storageManager.getVaultRoot() }) {
                                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                                }
                            }
                            Text(
                                text = if (currentDir == storageManager.getVaultRoot()) "Vault" else currentDir.name,
                                color = Color.White,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { isCreateFolderOpen = true }) {
                                Icon(Icons.Default.CreateNewFolder, contentDescription = "New Folder", tint = Color(0xFF8B5CF6))
                            }
                            IconButton(onClick = { filePickerLauncher.launch("*/*") }) {
                                Icon(Icons.Default.UploadFile, contentDescription = "Upload", tint = Color(0xFF06B6D4))
                            }
                            IconButton(onClick = { isSearchExpanded = true }) {
                                Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                            }
                            IconButton(onClick = { isSettingsOpen = true }) {
                                Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color.White)
                            }
                            IconButton(onClick = { isDrawerOpen = true }) {
                                Icon(Icons.Default.Menu, contentDescription = "Filters", tint = Color.White)
                            }
                        }
                    }
                }
            }

            LazyVerticalGrid(
                columns = GridCells.Fixed(gridColumns),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp),
                contentPadding = PaddingValues(bottom = 100.dp, top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredList) { item ->
                    val isSelected = selectedItems.value.contains(item)
                    val isStarred = metadataManager.getStarredPaths().contains(item.file.absolutePath)

                    GlassBox(
                        shape = RoundedCornerShape(16.dp),
                        borderColors = if (isSelected) listOf(Color(0xFF8B5CF6), Color(0xFFEC4899)) else listOf(Color.White.copy(alpha = 0.15f), Color.White.copy(alpha = 0.05f)),
                        backgroundColors = if (isSelected) listOf(Color(0xFF8B5CF6).copy(alpha = 0.35f), Color(0xFF6D28D9).copy(alpha = 0.2f)) else listOf(Color(0xFF13111C).copy(alpha = 0.85f), Color(0xFF09070F).copy(alpha = 0.95f)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .combinedClickable(
                                onClick = {
                                    if (isSelectionMode) {
                                        selectedItems.value = if (isSelected) selectedItems.value - item else selectedItems.value + item
                                    } else {
                                        if (item.isDirectory) currentDir = item.file else activeViewerFile = item.file
                                    }
                                },
                                onLongClick = {
                                    selectedItems.value = if (isSelected) selectedItems.value - item else selectedItems.value + item
                                }
                            )
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = when {
                                        item.isDirectory -> Icons.Default.Folder
                                        item.extension == "pdf" -> Icons.Default.PictureAsPdf
                                        item.extension in listOf("jpg", "png", "webp", "jpeg") -> Icons.Default.Image
                                        else -> Icons.Default.Description
                                    },
                                    contentDescription = null,
                                    tint = if (item.isDirectory) Color(0xFF8B5CF6) else Color(0xFF06B6D4),
                                    modifier = Modifier.size(24.dp)
                                )

                                IconButton(
                                    onClick = {
                                        metadataManager.toggleStar(item.file.absolutePath)
                                        refresh()
                                    },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Star,
                                        contentDescription = "Star",
                                        tint = if (isStarred) Color(0xFFFBBF24) else Color.White.copy(alpha = 0.2f),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = item.name,
                                color = Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = if (item.isDirectory) "${item.itemCount} items" else "${item.sizeBytes / 1024} KB",
                                color = Color.White.copy(alpha = 0.45f),
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }
        }

        SlideMenuPanel(
            isOpen = isDrawerOpen,
            onClose = { isDrawerOpen = false },
            currentFilter = filterMode,
            selectedBadgeId = selectedBadgeId,
            badges = metadataManager.loadBadges(),
            onSelectFilter = { mode, badgeId ->
                filterMode = mode
                selectedBadgeId = badgeId
            },
            onCreateBadgeClick = { isCreateBadgeOpen = true }
        )

        if (isCreateFolderOpen) {
            SimpleInputDialog(
                title = "Create New Folder",
                confirmButtonText = "Create",
                onDismiss = { isCreateFolderOpen = false },
                onConfirm = { name ->
                    storageManager.createFolder(currentDir, name)
                    isCreateFolderOpen = false
                    refresh()
                }
            )
        }

        if (isCreateBadgeOpen) {
            CreateBadgeDialog(
                onDismiss = { isCreateBadgeOpen = false },
                onConfirm = { name, hex ->
                    val list = metadataManager.loadBadges().toMutableList()
                    list.add(com.sepfol.app.storage.CustomBadge(System.currentTimeMillis().toString(), name, hex))
                    metadataManager.saveBadges(list)
                    isCreateBadgeOpen = false
                }
            )
        }

        if (renameTarget != null) {
            SimpleInputDialog(
                title = "Rename Item",
                initialText = renameTarget!!.name,
                confirmButtonText = "Rename",
                onDismiss = { renameTarget = null },
                onConfirm = { newName ->
                    storageManager.renameItem(renameTarget!!.file, newName)
                    renameTarget = null
                    refresh()
                }
            )
        }

        if (isSettingsOpen) {
            SettingsDialog(
                currentTheme = currentTheme,
                onThemeChange = onThemeChange,
                currentGridCols = gridColumns,
                onGridColsChange = { gridColumns = it },
                onExportBackup = { },
                onImportBackup = { },
                onDismiss = { isSettingsOpen = false }
            )
        }
    }
}
