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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.text.input.KeyboardType
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

    val hours = secondsLeft / 3600
    val minutes = (secondsLeft % 3600) / 60
    val secs = secondsLeft % 60
    val timeFormatted = if (hours > 0) {
        String.format("%02d:%02d:%02d", hours, minutes, secs)
    } else {
        String.format("%02d:%02d", minutes, secs)
    }

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
        var customHours by remember { mutableStateOf("") }
        var customMins by remember { mutableStateOf("") }

        Dialog(onDismissRequest = { isSettingsOpen = false }) {
            GlassBox(
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(22.dp)) {
                    Text("Focus Study Timer", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(14.dp))

                    Text("QUICK PRESETS", color = Color.White.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))

                    val presets = listOf(15, 25, 45, 60, 120, 180)
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
                                Box(modifier = Modifier.padding(vertical = 10.dp).align(Alignment.Center)) {
                                    Text("${mins}m", color = Color.White, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        presets.drop(3).forEach { mins ->
                            val label = if (mins >= 60) "${mins / 60}h" else "${mins}m"
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
                                Box(modifier = Modifier.padding(vertical = 10.dp).align(Alignment.Center)) {
                                    Text(label, color = Color.White, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))
                    Text("CUSTOM DURATION (MAX 5 HOURS)", color = Color.White.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = customHours,
                            onValueChange = { if (it.length <= 1) customHours = it },
                            placeholder = { Text("Hr (0-5)", color = Color.White.copy(alpha = 0.3f), fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                                focusedBorderColor = Color(0xFF8B5CF6), unfocusedBorderColor = Color.White.copy(alpha = 0.2f)
                            ),
                            modifier = Modifier.weight(1f)
                        )

                        OutlinedTextField(
                            value = customMins,
                            onValueChange = { if (it.length <= 2) customMins = it },
                            placeholder = { Text("Min (0-59)", color = Color.White.copy(alpha = 0.3f), fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                                focusedBorderColor = Color(0xFF8B5CF6), unfocusedBorderColor = Color.White.copy(alpha = 0.2f)
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { isSettingsOpen = false }) { Text("Cancel", color = Color.White.copy(alpha = 0.6f)) }
                        Spacer(modifier = Modifier.width(8.dp))
                        ElevatedButton(
                            onClick = {
                                val h = customHours.toIntOrNull() ?: 0
                                val m = customMins.toIntOrNull() ?: 0
                                val total = (h.coerceIn(0, 5) * 3600) + (m.coerceIn(0, 59) * 60)
                                if (total > 0) {
                                    totalSeconds = total
                                    secondsLeft = total
                                    isRunning = false
                                }
                                isSettingsOpen = false
                            },
                            colors = ButtonDefaults.elevatedButtonColors(containerColor = Color(0xFF8B5CF6), contentColor = Color.White)
                        ) {
                            Text("Apply")
                        }
                    }
                }
            }
        }
    }
}
