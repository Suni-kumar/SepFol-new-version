package com.sepfol.app.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.Style
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.sepfol.app.components.SplashScreen
import com.sepfol.app.core.SpeedDialOption
import com.sepfol.app.core.Workspace
import com.sepfol.app.core.WorkspaceRootContainer
import com.sepfol.app.flashcards.FlashcardsScreen
import com.sepfol.app.folder.FolderScreen
import com.sepfol.app.study.FloatingTimerWidget
import com.sepfol.app.theme.SepFolTheme

@Composable
fun SepFolNavigation() {
    var isSplashVisible by remember { mutableStateOf(true) }
    var currentWorkspace by remember { mutableStateOf(Workspace.DATA) }
    var currentTheme by remember { mutableStateOf(SepFolTheme.CYBER_AMOLED) }
    var isTimerActive by remember { mutableStateOf(false) }

    var triggerCreateFolder by remember { mutableStateOf(false) }
    var triggerImportFile by remember { mutableStateOf(false) }

    val speedDialOptions = when (currentWorkspace) {
        Workspace.DATA -> listOf(
            SpeedDialOption("New Folder", Icons.Default.CreateNewFolder, Color(0xFF8B5CF6)) { triggerCreateFolder = true },
            SpeedDialOption("Import Document", Icons.Default.UploadFile, Color(0xFF06B6D4)) { triggerImportFile = true },
            SpeedDialOption("Focus Timer", Icons.Default.Timer, Color(0xFFEC4899)) { isTimerActive = true }
        )
        Workspace.FLASHCARDS -> listOf(
            SpeedDialOption("Focus Timer", Icons.Default.Timer, Color(0xFF8B5CF6)) { isTimerActive = true }
        )
    }

    SepFolTheme(theme = currentTheme) {
        Box(modifier = Modifier.fillMaxSize()) {
            if (isSplashVisible) {
                SplashScreen(onSplashFinished = { isSplashVisible = false })
            } else {
                WorkspaceRootContainer(
                    currentWorkspace = currentWorkspace,
                    speedDialOptions = speedDialOptions,
                    onWorkspaceChange = { currentWorkspace = it }
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        when (currentWorkspace) {
                            Workspace.DATA -> FolderScreen(
                                currentTheme = currentTheme,
                                onThemeChange = { currentTheme = it },
                                triggerCreateFolder = triggerCreateFolder,
                                onFolderCreateHandled = { triggerCreateFolder = false },
                                triggerImportFile = triggerImportFile,
                                onFileImportHandled = { triggerImportFile = false }
                            )
                            Workspace.FLASHCARDS -> FlashcardsScreen()
                        }

                        FloatingTimerWidget(
                            isVisible = isTimerActive,
                            onDismiss = { isTimerActive = false }
                        )
                    }
                }
            }
        }
    }
}
