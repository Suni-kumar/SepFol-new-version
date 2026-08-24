package com.sepfol.app.storage

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

data class FlashCard(
    val id: String,
    val question: String,
    val answer: String,
    val isMastered: Boolean = false
)

data class FlashDeck(
    val id: String,
    val name: String,
    val cards: List<FlashCard> = emptyList(),
    val paletteIndex: Int = 0
)

data class CustomBadge(
    val id: String,
    val name: String,
    val colorHex: String
)

class MetadataManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("sepfol_meta_prefs", Context.MODE_PRIVATE)

    // Flashcards CRUD
    fun saveDecks(decks: List<FlashDeck>) {
        val rootArray = JSONArray()
        decks.forEach { deck ->
            val deckObj = JSONObject().apply {
                put("id", deck.id)
                put("name", deck.name)
                put("paletteIndex", deck.paletteIndex)
                val cardArray = JSONArray()
                deck.cards.forEach { card ->
                    val cardObj = JSONObject().apply {
                        put("id", card.id)
                        put("question", card.question)
                        put("answer", card.answer)
                        put("isMastered", card.isMastered)
                    }
                    cardArray.put(cardObj)
                }
                put("cards", cardArray)
            }
            rootArray.put(deckObj)
        }
        prefs.edit().putString("decks_json", rootArray.toString()).apply()
    }

    fun loadDecks(): List<FlashDeck> {
        val jsonStr = prefs.getString("decks_json", null) ?: return emptyList()
        val list = mutableListOf<FlashDeck>()
        try {
            val rootArray = JSONArray(jsonStr)
            for (i in 0 until rootArray.length()) {
                val deckObj = rootArray.getJSONObject(i)
                val cardArray = deckObj.getJSONArray("cards")
                val cards = mutableListOf<FlashCard>()
                for (j in 0 until cardArray.length()) {
                    val cardObj = cardArray.getJSONObject(j)
                    cards.add(
                        FlashCard(
                            id = cardObj.getString("id"),
                            question = cardObj.getString("question"),
                            answer = cardObj.getString("answer"),
                            isMastered = cardObj.optBoolean("isMastered", false)
                        )
                    )
                }
                list.add(
                    FlashDeck(
                        id = deckObj.getString("id"),
                        name = deckObj.getString("name"),
                        paletteIndex = deckObj.optInt("paletteIndex", 0),
                        cards = cards
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return list
    }

    // Custom Badges CRUD
    fun saveBadges(badges: List<CustomBadge>) {
        val array = JSONArray()
        badges.forEach {
            val obj = JSONObject().apply {
                put("id", it.id)
                put("name", it.name)
                put("colorHex", it.colorHex)
            }
            array.put(obj)
        }
        prefs.edit().putString("badges_json", array.toString()).apply()
    }

    fun loadBadges(): List<CustomBadge> {
        val jsonStr = prefs.getString("badges_json", null) ?: return emptyList()
        val list = mutableListOf<CustomBadge>()
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    CustomBadge(
                        id = obj.getString("id"),
                        name = obj.getString("name"),
                        colorHex = obj.getString("colorHex")
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return list
    }

    // Starred Items
    fun getStarredPaths(): Set<String> = prefs.getStringSet("starred_paths", emptySet()) ?: emptySet()

    fun toggleStar(path: String) {
        val current = getStarredPaths().toMutableSet()
        if (current.contains(path)) current.remove(path) else current.add(path)
        prefs.edit().putStringSet("starred_paths", current).apply()
    }
}
