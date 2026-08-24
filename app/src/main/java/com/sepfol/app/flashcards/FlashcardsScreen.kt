package com.sepfol.app.flashcards

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DriveFileRenameOutline
import androidx.compose.material.icons.filled.FormatListBulleted
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Style
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sepfol.app.components.SimpleInputDialog
import com.sepfol.app.storage.FlashCard
import com.sepfol.app.storage.FlashDeck
import com.sepfol.app.storage.MetadataManager
import com.sepfol.app.theme.GlassBox

val PaletteGradients = listOf(
    listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)), // Cyber Sapphire
    listOf(Color(0xFFEC4899), Color(0xFFBE185D)), // Nebula Violet
    listOf(Color(0xFF10B981), Color(0xFF047857)), // Emerald Aurora
    listOf(Color(0xFF334155), Color(0xFF0F172A)), // Obsidian
    listOf(Color(0xFFF97316), Color(0xFFC2410C)), // Sunset Ember
    listOf(Color(0xFF6366F1), Color(0xFF4338CA))  // Frosted Velvet
)

@Composable
fun FlashcardsScreen() {
    val context = LocalContext.current
    val metadataManager = remember { MetadataManager(context) }
    var decks by remember { mutableStateOf(metadataManager.loadDecks()) }

    var selectedDeckForRevision by remember { mutableStateOf<FlashDeck?>(null) }
    val selectedDecks = remember { mutableStateOf(setOf<FlashDeck>()) }
    val isSelectionMode = selectedDecks.value.isNotEmpty()

    var isSettingsOpen by remember { mutableStateOf(false) }
    var isCreateDeckOpen by remember { mutableStateOf(false) }
    var renameDeckTarget by remember { mutableStateOf<FlashDeck?>(null) }
    var gridColumns by remember { mutableIntStateOf(1) }

    fun refreshDecks() {
        decks = metadataManager.loadDecks()
        selectedDecks.value = emptySet()
    }

    BackHandler(enabled = isSelectionMode || selectedDeckForRevision != null) {
        if (selectedDeckForRevision != null) {
            selectedDeckForRevision = null
            refreshDecks()
        } else {
            selectedDecks.value = emptySet()
        }
    }

    if (selectedDeckForRevision != null) {
        FlashcardRevisionScreen(
            deck = selectedDeckForRevision!!,
            onBack = {
                selectedDeckForRevision = null
                refreshDecks()
            },
            onSaveDeck = { updated ->
                val list = decks.map { if (it.id == updated.id) updated else it }
                metadataManager.saveDecks(list)
                refreshDecks()
            }
        )
        return
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF07060B))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // Sleek TopBar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 40.dp, start = 16.dp, end = 16.dp, bottom = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (isSelectionMode) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { selectedDecks.value = emptySet() }) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                        }
                        Text(
                            text = "${selectedDecks.value.size} Selected",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (selectedDecks.value.size == 1) {
                            IconButton(onClick = { renameDeckTarget = selectedDecks.value.first() }) {
                                Icon(Icons.Default.DriveFileRenameOutline, contentDescription = "Rename", tint = Color.White)
                            }
                        }
                        IconButton(onClick = {
                            val remaining = decks.filterNot { selectedDecks.value.contains(it) }
                            metadataManager.saveDecks(remaining)
                            refreshDecks()
                        }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFEF4444))
                        }
                    }
                } else {
                    Text(
                        text = "Revision Flashcards",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { isCreateDeckOpen = true }) {
                            Icon(Icons.Default.Add, contentDescription = "Add Deck", tint = Color(0xFFEC4899))
                        }
                        IconButton(onClick = { isSettingsOpen = true }) {
                            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color.White)
                        }
                    }
                }
            }

            // Decks Dynamic Grid (1-3 Columns)
            LazyVerticalGrid(
                columns = GridCells.Fixed(gridColumns),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 14.dp),
                contentPadding = PaddingValues(bottom = 100.dp, top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(decks) { deck ->
                    val isSelected = selectedDecks.value.contains(deck)
                    val masteredCount = deck.cards.count { it.isMastered }
                    val gradient = PaletteGradients.getOrElse(deck.paletteIndex) { PaletteGradients[0] }

                    GlassBox(
                        shape = RoundedCornerShape(20.dp),
                        borderColors = if (isSelected) listOf(Color(0xFFEC4899), Color(0xFF8B5CF6)) else listOf(Color.White.copy(alpha = 0.15f), Color.White.copy(alpha = 0.05f)),
                        backgroundColors = if (isSelected) {
                            listOf(Color(0xFFEC4899).copy(alpha = 0.35f), Color(0xFFBE185D).copy(alpha = 0.2f))
                        } else {
                            listOf(Color(0xFF14121E).copy(alpha = 0.85f), Color(0xFF0A0912).copy(alpha = 0.95f))
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .combinedClickable(
                                onClick = {
                                    if (isSelectionMode) {
                                        selectedDecks.value = if (isSelected) selectedDecks.value - deck else selectedDecks.value + deck
                                    } else {
                                        selectedDeckForRevision = deck
                                    }
                                },
                                onLongClick = {
                                    selectedDecks.value = if (isSelected) selectedDecks.value - deck else selectedDecks.value + deck
                                }
                            )
                    ) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = deck.name,
                                    color = Color.White,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f)
                                )
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .clip(CircleShape)
                                        .background(gradient[0])
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "${deck.cards.size} Cards  •  $masteredCount Mastered",
                                color = Color.White.copy(alpha = 0.5f),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }

        // Popups
        if (isCreateDeckOpen) {
            SimpleInputDialog(
                title = "Create New Deck",
                confirmButtonText = "Create",
                onDismiss = { isCreateDeckOpen = false },
                onConfirm = { name ->
                    val list = decks.toMutableList()
                    list.add(FlashDeck(id = System.currentTimeMillis().toString(), name = name, paletteIndex = (0..5).random()))
                    metadataManager.saveDecks(list)
                    isCreateDeckOpen = false
                    refreshDecks()
                }
            )
        }

        if (renameDeckTarget != null) {
            SimpleInputDialog(
                title = "Rename Deck",
                initialText = renameDeckTarget!!.name,
                confirmButtonText = "Rename",
                onDismiss = { renameDeckTarget = null },
                onConfirm = { newName ->
                    val list = decks.map { if (it.id == renameDeckTarget!!.id) it.copy(name = newName) else it }
                    metadataManager.saveDecks(list)
                    renameDeckTarget = null
                    refreshDecks()
                }
            )
        }

        if (isSettingsOpen) {
            DeckSettingsSheet(
                currentGridCols = gridColumns,
                onGridColsChange = { gridColumns = it },
                onDismiss = { isSettingsOpen = false }
            )
        }
    }
}

@Composable
private fun DeckSettingsSheet(
    currentGridCols: Int,
    onGridColsChange: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        GlassBox(
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(22.dp)) {
                Text("Flashcards Grid Layout", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    (1..3).forEach { cols ->
                        GlassBox(
                            shape = RoundedCornerShape(12.dp),
                            backgroundColors = if (currentGridCols == cols) {
                                listOf(Color(0xFFEC4899), Color(0xFFBE185D))
                            } else {
                                listOf(Color.White.copy(alpha = 0.08f), Color.White.copy(alpha = 0.04f))
                            },
                            onClick = { onGridColsChange(cols) },
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(modifier = Modifier.padding(vertical = 12.dp).align(Alignment.Center)) {
                                Text("$cols Column", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }
            }
        }
    }
}
