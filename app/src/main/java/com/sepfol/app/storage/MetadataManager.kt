package com.sepfol.app.storage

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

data class FlashCard(val id: String, val question: String, val answer: String, val isMastered: Boolean = false)
data class FlashDeck(val id: String, val name: String, val cards: List<FlashCard> = emptyList(), val paletteIndex: Int = 0)
data class CustomBadge(val id: String, val name: String, val colorHex: String)

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
                    cards.add(FlashCard(cardObj.getString("id"), cardObj.getString("question"), cardObj.getString("answer"), cardObj.optBoolean("isMastered", false)))
                }
                list.add(FlashDeck(deckObj.getString("id"), deckObj.getString("name"), cards, deckObj.optInt("paletteIndex", 0)))
            }
        } catch (e: Exception) { e.printStackTrace() }
        return list
    }

    // Custom Badges CRUD
    fun saveBadges(badges: List<CustomBadge>) {
        val array = JSONArray()
        badges.forEach {
            array.put(JSONObject().apply { put("id", it.id); put("name", it.name); put("colorHex", it.colorHex) })
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
                list.add(CustomBadge(obj.getString("id"), obj.getString("name"), obj.getString("colorHex")))
            }
        } catch (e: Exception) { e.printStackTrace() }
        return list
    }

    // MULTI-BADGE ITEM MAPPING (New Feature)
    fun setItemBadges(filePath: String, badgeIds: List<String>) {
        val array = JSONArray()
        badgeIds.forEach { array.put(it) }
        prefs.edit().putString("badges_mapped_$filePath", array.toString()).apply()
    }

    fun getItemBadges(filePath: String): List<String> {
        val jsonStr = prefs.getString("badges_mapped_$filePath", null) ?: return emptyList()
        val list = mutableListOf<String>()
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                list.add(array.getString(i))
            }
        } catch (e: Exception) { e.printStackTrace() }
        return list
    }

    // Starred Items
    fun getStarredPaths(): Set<String> = prefs.getStringSet("starred_paths", emptySet()) ?: emptySet()
    fun toggleStar(path: String) {
        val current = getStarredPaths().toMutableSet()
        if (current.contains(path)) current.remove(path) else current.add(path)
        prefs.edit().putStringSet("starred_paths", current).apply()
    }

    // PDF Bookmarks (Last read page)
    fun savePdfPage(filePath: String, page: Int) {
        prefs.edit().putInt("pdf_page_$filePath", page).apply()
    }
    fun getPdfPage(filePath: String): Int {
        return prefs.getInt("pdf_page_$filePath", 0)
    }
}
