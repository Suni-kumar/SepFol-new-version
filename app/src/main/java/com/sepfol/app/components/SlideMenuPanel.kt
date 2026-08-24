package com.sepfol.app.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Label
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sepfol.app.storage.CustomBadge
import com.sepfol.app.theme.GlassBox

enum class VaultFilterMode {
    ALL, STARRED, BADGE
}

@Composable
fun SlideMenuPanel(
    isOpen: Boolean,
    onClose: () -> Unit,
    currentFilter: VaultFilterMode,
    selectedBadgeId: String?,
    badges: List<CustomBadge>,
    onSelectFilter: (VaultFilterMode, String?) -> Unit,
    onCreateBadgeClick: () -> Unit
) {
    if (!isOpen) return

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.6f))
            .clickable { onClose() }
    ) {
        AnimatedVisibility(
            visible = isOpen,
            enter = slideInHorizontally(initialOffsetX = { it }) + fadeIn(),
            exit = slideOutHorizontally(targetOffsetX = { it }) + fadeOut(),
            modifier = Modifier.align(Alignment.CenterEnd)
        ) {
            GlassBox(
                shape = RoundedCornerShape(topStart = 28.dp, bottomStart = 28.dp),
                modifier = Modifier
                    .fillMaxHeight()
                    .width(300.dp)
                    .clickable(enabled = false) {}
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Filter Vault",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                        IconButton(onClick = onClose) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    FilterItemRow(
                        icon = Icons.Default.Storage,
                        label = "All Files & Folders",
                        isSelected = currentFilter == VaultFilterMode.ALL,
                        onClick = { onSelectFilter(VaultFilterMode.ALL, null); onClose() }
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    FilterItemRow(
                        icon = Icons.Default.Star,
                        label = "Starred Items",
                        accentColor = Color(0xFFFBBF24),
                        isSelected = currentFilter == VaultFilterMode.STARRED,
                        onClick = { onSelectFilter(VaultFilterMode.STARRED, null); onClose() }
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "CUSTOM BADGES",
                            color = Color.White.copy(alpha = 0.5f),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        IconButton(
                            onClick = onCreateBadgeClick,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add Badge", tint = Color(0xFF8B5CF6))
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(badges) { badge ->
                            val color = try {
                                Color(android.graphics.Color.parseColor(badge.colorHex))
                            } catch (e: Exception) {
                                Color(0xFF8B5CF6)
                            }
                            val isSelected = currentFilter == VaultFilterMode.BADGE && selectedBadgeId == badge.id

                            GlassBox(
                                shape = RoundedCornerShape(12.dp),
                                backgroundColors = if (isSelected) {
                                    listOf(color.copy(alpha = 0.35f), color.copy(alpha = 0.15f))
                                } else {
                                    listOf(Color.White.copy(alpha = 0.05f), Color.White.copy(alpha = 0.02f))
                                },
                                onClick = {
                                    onSelectFilter(VaultFilterMode.BADGE, badge.id)
                                    onClose()
                                }
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(10.dp)
                                            .clip(CircleShape)
                                            .background(color)
                                    )
                                    Text(
                                        text = badge.name,
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FilterItemRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    accentColor: Color = Color.White,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    GlassBox(
        shape = RoundedCornerShape(14.dp),
        backgroundColors = if (isSelected) {
            listOf(Color(0xFF8B5CF6).copy(alpha = 0.4f), Color(0xFF6D28D9).copy(alpha = 0.2f))
        } else {
            listOf(Color.White.copy(alpha = 0.05f), Color.White.copy(alpha = 0.02f))
        },
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(20.dp))
            Text(label, color = Color.White, fontSize = 14.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium)
        }
    }
}
