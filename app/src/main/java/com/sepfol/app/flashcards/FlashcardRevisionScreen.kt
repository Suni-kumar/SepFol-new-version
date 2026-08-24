package com.sepfol.app.flashcards

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FormatListBulleted
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.sepfol.app.storage.FlashCard
import com.sepfol.app.storage.FlashDeck
import com.sepfol.app.theme.GlassBox

@Composable
fun FlashcardRevisionScreen(
    deck: FlashDeck,
    onBack: () -> Unit,
    onSaveDeck: (FlashDeck) -> Unit
) {
    var currentCards by remember { mutableStateOf(deck.cards) }
    var currentIndex by remember { mutableIntStateOf(0) }
    var isFlipped by remember { mutableStateOf(false) }

    var isManagerOpen by remember { mutableStateOf(false) }
    var isAddCardOpen by remember { mutableStateOf(false) }
    var activeExpandedText by remember { mutableStateOf<String?>(null) }

    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(durationMillis = 400),
        label = "FlipAnimation"
    )

    fun persistCards(updated: List<FlashCard>) {
        currentCards = updated
        onSaveDeck(deck.copy(cards = updated))
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF07060B))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Clean Top Navigation Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp, bottom = 20.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text(
                    text = deck.name,
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = { isManagerOpen = true }) {
                    Icon(Icons.Default.FormatListBulleted, contentDescription = "Card Manager", tint = Color(0xFFEC4899))
                }
            }

            if (currentCards.isEmpty()) {
                Box(
                    modifier = Modifier.weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    ElevatedButton(
                        onClick = { isAddCardOpen = true },
                        colors = ButtonDefaults.elevatedButtonColors(
                            containerColor = Color(0xFFEC4899),
                            contentColor = Color.White
                        )
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Spacer(modifier = Modifier.size(8.dp))
                        Text("Add First Card")
                    }
                }
            } else {
                val currentCard = currentCards.getOrNull(currentIndex) ?: currentCards.first()

                Text(
                    text = "Card ${currentIndex + 1} of ${currentCards.size}",
                    color = Color(0xFFEC4899),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(20.dp))

                // 3D Glass Flip Card
                GlassBox(
                    shape = RoundedCornerShape(28.dp),
                    backgroundColors = listOf(Color(0xFF1A1528).copy(alpha = 0.9f), Color(0xFF0F0C18).copy(alpha = 0.95f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .graphicsLayer {
                            rotationY = rotation
                            cameraDistance = 12f * density
                        }
                        .clickable { isFlipped = !isFlipped }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp)
                            .graphicsLayer {
                                if (rotation > 90f) rotationY = 180f
                            },
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = if (rotation <= 90f) "QUESTION / CONCEPT" else "ANSWER / REVISION",
                            color = Color(0xFFEC4899),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        val displayText = if (rotation <= 90f) currentCard.question else currentCard.answer
                        Text(
                            text = displayText,
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.SemiBold,
                            textAlign = TextAlign.Center,
                            maxLines = 6,
                            overflow = TextOverflow.Ellipsis
                        )

                        if (displayText.length > 150) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Tap to expand reader...",
                                color = Color(0xFF8B5CF6),
                                fontSize = 12.sp,
                                modifier = Modifier.clickable { activeExpandedText = displayText }
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))
                        Text("Tap to Flip", color = Color.White.copy(alpha = 0.35f), fontSize = 11.sp)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Mastery Toggle Button
                ElevatedButton(
                    onClick = {
                        val updated = currentCards.toMutableList()
                        val current = updated[currentIndex]
                        updated[currentIndex] = current.copy(isMastered = !current.isMastered)
                        persistCards(updated)
                    },
                    colors = ButtonDefaults.elevatedButtonColors(
                        containerColor = if (currentCard.isMastered) Color(0xFF10B981) else Color.White.copy(alpha = 0.15f),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(48.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (currentCard.isMastered) Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
                        Text(if (currentCard.isMastered) "Mastered" else "Mark Mastered")
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Navigation Controls (Prev / Next)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = {
                            if (currentIndex > 0) {
                                isFlipped = false
                                currentIndex--
                            }
                        },
                        enabled = currentIndex > 0
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Previous", tint = if (currentIndex > 0) Color.White else Color.White.copy(alpha = 0.2f))
                    }

                    IconButton(onClick = { isAddCardOpen = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Card", tint = Color(0xFFEC4899))
                    }

                    IconButton(
                        onClick = {
                            if (currentIndex < currentCards.size - 1) {
                                isFlipped = false
                                currentIndex++
                            }
                        },
                        enabled = currentIndex < currentCards.size - 1
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Next", tint = if (currentIndex < currentCards.size - 1) Color.White else Color.White.copy(alpha = 0.2f))
                    }
                }
            }
        }

        // Expanded Large-Text Reader Overlay
        if (activeExpandedText != null) {
            Dialog(onDismissRequest = { activeExpandedText = null }) {
                GlassBox(
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(400.dp)
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
                            Text("Full Content Reader", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            IconButton(onClick = { activeExpandedText = null }) {
                                Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .verticalScroll(rememberScrollState())
                        ) {
                            Text(activeExpandedText!!, color = Color.White, fontSize = 15.sp, lineHeight = 22.sp)
                        }
                    }
                }
            }
        }

        // Card Manager Sheet (Re-order / Delete / Edit)
        if (isManagerOpen) {
            Dialog(onDismissRequest = { isManagerOpen = false }) {
                GlassBox(
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(480.dp)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Manage Deck Cards", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(16.dp))

                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(currentCards) { card ->
                                GlassBox(shape = RoundedCornerShape(12.dp)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(card.question, color = Color.White, fontSize = 14.sp, maxLines = 1, modifier = Modifier.weight(1f))
                                        IconButton(onClick = {
                                            val updated = currentCards.filterNot { it.id == card.id }
                                            persistCards(updated)
                                            if (currentIndex >= updated.size && currentIndex > 0) currentIndex--
                                        }) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFEF4444), modifier = Modifier.size(18.dp))
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                            TextButton(onClick = { isManagerOpen = false }) {
                                Text("Done", color = Color.White)
                            }
                        }
                    }
                }
            }
        }

        // Add Card Dialog
        if (isAddCardOpen) {
            var qText by remember { mutableStateOf("") }
            var aText by remember { mutableStateOf("") }

            Dialog(onDismissRequest = { isAddCardOpen = false }) {
                GlassBox(
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(22.dp)) {
                        Text("Add New Revision Card", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(16.dp))

                        OutlinedTextField(
                            value = qText,
                            onValueChange = { qText = it },
                            placeholder = { Text("Question / Term", color = Color.White.copy(alpha = 0.4f)) },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = Color(0xFFEC4899),
                                unfocusedBorderColor = Color.White.copy(alpha = 0.2f)
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = aText,
                            onValueChange = { aText = it },
                            placeholder = { Text("Answer / Explanation", color = Color.White.copy(alpha = 0.4f)) },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = Color(0xFFEC4899),
                                unfocusedBorderColor = Color.White.copy(alpha = 0.2f)
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                            TextButton(onClick = { isAddCardOpen = false }) {
                                Text("Cancel", color = Color.White.copy(alpha = 0.7f))
                            }
                            Spacer(modifier = Modifier.size(8.dp))
                            ElevatedButton(
                                onClick = {
                                    if (qText.isNotBlank() && aText.isNotBlank()) {
                                        val updated = currentCards.toMutableList()
                                        updated.add(FlashCard(id = System.currentTimeMillis().toString(), question = qText, answer = aText))
                                        persistCards(updated)
                                        isAddCardOpen = false
                                    }
                                },
                                colors = ButtonDefaults.elevatedButtonColors(containerColor = Color(0xFFEC4899), contentColor = Color.White)
                            ) {
                                Text("Add Card")
                            }
                        }
                    }
                }
            }
        }
    }
}
