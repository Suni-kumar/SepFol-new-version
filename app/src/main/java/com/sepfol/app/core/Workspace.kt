package com.sepfol.app.core

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Style
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sepfol.app.theme.GlassBox

enum class Workspace(val title: String) {
    DATA("SepFol Data"),
    FLASHCARDS("SepFol Flashcards")
}

@Composable
fun WorkspaceRootContainer(
    currentWorkspace: Workspace,
    onWorkspaceChange: (Workspace) -> Unit,
    onFabClick: () -> Unit,
    content: @Composable () -> Unit
) {
    var isDockOpen by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        content()

        // Switcher Dock Triggered by Drag-Up
        AnimatedVisibility(
            visible = isDockOpen,
            enter = fadeIn() + slideInVertically(initialOffsetY = { it / 2 }),
            exit = fadeOut() + slideOutVertically(targetOffsetY = { it / 2 }),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 100.dp)
        ) {
            GlassBox(
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.padding(horizontal = 24.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    GlassBox(
                        shape = RoundedCornerShape(16.dp),
                        backgroundColors = if (currentWorkspace == Workspace.DATA) {
                            listOf(Color(0xFF8B5CF6).copy(alpha = 0.5f), Color(0xFF6D28D9).copy(alpha = 0.6f))
                        } else {
                            listOf(Color.Transparent, Color.Transparent)
                        },
                        onClick = {
                            onWorkspaceChange(Workspace.DATA)
                            isDockOpen = false
                        }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Folder, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Text("Vault", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }

                    GlassBox(
                        shape = RoundedCornerShape(16.dp),
                        backgroundColors = if (currentWorkspace == Workspace.FLASHCARDS) {
                            listOf(Color(0xFFEC4899).copy(alpha = 0.5f), Color(0xFFBE185D).copy(alpha = 0.6f))
                        } else {
                            listOf(Color.Transparent, Color.Transparent)
                        },
                        onClick = {
                            onWorkspaceChange(Workspace.FLASHCARDS)
                            isDockOpen = false
                        }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Style, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Text("Flashcards", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Main FAB with Drag-Up gesture support
        FloatingActionButton(
            onClick = {
                if (isDockOpen) isDockOpen = false else onFabClick()
            },
            shape = CircleShape,
            containerColor = Color.Transparent,
            elevation = FloatingActionButtonDefaults.elevation(0.dp),
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(24.dp)
                .size(60.dp)
                .background(
                    brush = Brush.linearGradient(listOf(Color(0xFF8B5CF6), Color(0xFFEC4899))),
                    shape = CircleShape
                )
                .pointerInput(Unit) {
                    detectVerticalDragGestures { change, dragAmount ->
                        change.consume()
                        if (dragAmount < -15) {
                            isDockOpen = true
                        } else if (dragAmount > 15) {
                            isDockOpen = false
                        }
                    }
                }
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Action FAB",
                tint = Color.White,
                modifier = Modifier.size(28.dp)
            )
        }
    }
}
