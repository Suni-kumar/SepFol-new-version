package com.sepfol.app.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.sepfol.app.core.Workspace
import com.sepfol.app.core.WorkspaceRootContainer
import com.sepfol.app.flashcards.FlashcardsScreen
import com.sepfol.app.folder.FolderScreen
import com.sepfol.app.study.FloatingTimerWidget
import com.sepfol.app.theme.SepFolTheme

@Composable
fun SepFolNavigation() {
    var currentWorkspace by remember { mutableStateOf(Workspace.DATA) }
    var currentTheme by remember { mutableStateOf(SepFolTheme.CYBER_AMOLED) }
    var isTimerActive by remember { mutableStateOf(false) }

    SepFolTheme(theme = currentTheme) {
        WorkspaceRootContainer(
            currentWorkspace = currentWorkspace,
            onWorkspaceChange = { currentWorkspace = it },
            onFabClick = { isTimerActive = !isTimerActive }
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                when (currentWorkspace) {
                    Workspace.DATA -> FolderScreen(
                        currentTheme = currentTheme,
                        onThemeChange = { currentTheme = it }
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
