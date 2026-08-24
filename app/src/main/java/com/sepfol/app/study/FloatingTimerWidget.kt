package com.sepfol.app.study

import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.sepfol.app.theme.GlassBox
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

@Composable
fun FloatingTimerWidget(
    isVisible: Boolean,
    onDismiss: () -> Unit
) {
    if (!isVisible) return

    var offsetX by remember { mutableFloatStateOf(40f) }
    var offsetY by remember { mutableFloatStateOf(180f) }
    var totalSeconds by remember { mutableIntStateOf(1500) }
    var secondsLeft by remember { mutableIntStateOf(1500) }
    var isRunning by remember { mutableStateOf(false) }
    var isSettingsOpen by remember { mutableStateOf(false) }

    LaunchedEffect(isRunning, secondsLeft) {
        if (isRunning && secondsLeft > 0) {
            delay(1000L)
            secondsLeft--
        } else if (secondsLeft == 0) {
            isRunning = false
        }
    }

    val minutes = secondsLeft / 60
    val secs = secondsLeft % 60
    val timeFormatted = String.format("%02d:%02d", minutes, secs)

    Box(
        modifier = Modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    offsetX += dragAmount.x
                    offsetY += dragAmount.y
                }
            }
    ) {
        GlassBox(
            shape = CircleShape,
            borderColors = listOf(Color(0xFF8B5CF6).copy(alpha = 0.8f), Color(0xFFEC4899).copy(alpha = 0.5f)),
            backgroundColors = listOf(Color(0xFF13111C).copy(alpha = 0.95f), Color(0xFF09070F).copy(alpha = 0.98f)),
            modifier = Modifier.padding(4.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                IconButton(
                    onClick = { isRunning = !isRunning },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Toggle Timer",
                        tint = if (isRunning) Color(0xFF10B981) else Color(0xFFEC4899),
                        modifier = Modifier.size(18.dp)
                    )
                }

                Text(
                    text = timeFormatted,
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )

                IconButton(
                    onClick = { isSettingsOpen = true },
                    modifier = Modifier.size(22.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Timer,
                        contentDescription = "Set Timer",
                        tint = Color(0xFF8B5CF6),
                        modifier = Modifier.size(15.dp)
                    )
                }

                IconButton(
                    onClick = {
                        isRunning = false
                        onDismiss()
                    },
                    modifier = Modifier.size(20.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color.White.copy(alpha = 0.5f),
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }

    if (isSettingsOpen) {
        Dialog(onDismissRequest = { isSettingsOpen = false }) {
            GlassBox(
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(22.dp)) {
                    Text("Focus Study Duration", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(16.dp))

                    val presets = listOf(5, 10, 15, 25, 45, 60)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        presets.take(3).forEach { mins ->
                            GlassBox(
                                shape = RoundedCornerShape(12.dp),
                                backgroundColors = if (totalSeconds == mins * 60) listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)) else listOf(Color.White.copy(alpha = 0.08f), Color.White.copy(alpha = 0.04f)),
                                onClick = {
                                    totalSeconds = mins * 60
                                    secondsLeft = mins * 60
                                    isRunning = false
                                    isSettingsOpen = false
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(modifier = Modifier.padding(vertical = 12.dp).align(Alignment.Center)) {
                                    Text("${mins}m", color = Color.White, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        presets.drop(3).forEach { mins ->
                            GlassBox(
                                shape = RoundedCornerShape(12.dp),
                                backgroundColors = if (totalSeconds == mins * 60) listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)) else listOf(Color.White.copy(alpha = 0.08f), Color.White.copy(alpha = 0.04f)),
                                onClick = {
                                    totalSeconds = mins * 60
                                    secondsLeft = mins * 60
                                    isRunning = false
                                    isSettingsOpen = false
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(modifier = Modifier.padding(vertical = 12.dp).align(Alignment.Center)) {
                                    Text("${mins}m", color = Color.White, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        ElevatedButton(
                            onClick = { isSettingsOpen = false },
                            colors = ButtonDefaults.elevatedButtonColors(containerColor = Color(0xFF8B5CF6), contentColor = Color.White)
                        ) {
                            Text("Done")
                        }
                    }
                }
            }
        }
    }
}
