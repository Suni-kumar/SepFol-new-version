# Product Requirements Document (PRD)
**Project:** Native Android Migration for "SepFol" (AI Flashcards)
**Author:** Senior Android Architect & Technical Product Manager
**Date:** August 26, 2026

## Executive Summary
This document outlines the architectural guidelines, feature migration strategy, and technical roadmap for rewriting the existing Web/Capacitor-based "SepFol" (AI Flashcards) application into a 100% Native Android application using Kotlin, Jetpack Compose, and Modern Android Development (MAD) principles.

---

## 1. System Architecture & Tech Stack

The application will strictly adhere to **Clean Architecture** combined with the **MVVM (Model-View-ViewModel)** presentation pattern to ensure separation of concerns, testability, and scalability.

*   **Language:** Kotlin (1.9+)
*   **UI Toolkit:** Jetpack Compose with Material Design 3 guidelines for a modern, fluid, and reactive UI.
*   **Dependency Injection:** Dagger Hilt (Standardized, lifecycle-aware dependency injection).
*   **Asynchronous/Threading:** Kotlin Coroutines. State management in the UI will rely exclusively on `StateFlow` and `SharedFlow`.
*   **Local Database/Storage:** 
    *   **Room Database:** For relational, structured data persistence (Decks, Flashcards, Study Progress).
    *   **Jetpack DataStore (Preferences):** For lightweight key-value pairs (e.g., user preferences, theme settings).
*   **Networking:** Retrofit2 with OkHttp3 interceptors and `kotlinx.serialization` for consuming the AI Flashcard generation API.
*   **Architecture Pattern:** Clean Architecture (UI Layer -> Presentation/ViewModel -> Domain/UseCases -> Data/Repository -> Local/Remote Data Sources).

---

## 2. Feature-by-Feature Migration Plan

### Core MVP Features (Phase 1)
| Current Web Feature (TypeScript/React) | Native Android Equivalent (Kotlin/Compose) | Description |
| :--- | :--- | :--- |
| **Deck List View** (`FlashcardsScreen`) | `DeckListScreen` (Composable) | LazyColumn displaying all generated decks. Uses `collectAsStateWithLifecycle()` to observe Room DB updates. |
| **AI Generation Dialog** (`AiDeckDialog`) | `AiGenerationBottomSheet` | Material 3 ModalBottomSheet for inputting the "Topic" and "Count" to generate new AI flashcards. |
| **Flashcard Study Mode** | `StudyPagerScreen` | Uses Accompanist Pager or Compose Foundation `HorizontalPager` with custom 3D rotation modifiers for the flip effect. |
| **Local Storage** (`localStorage`) | Room Database + Repository | Migrating untyped local storage to a robust, queryable SQLite database using Room DAOs. |
| **API Call** (`fetch('/api/generate-flashcards')`) | `FlashcardApiService` (Retrofit) | Retrofit interface for POST requests to generate JSON cards, handled in a `GenerateCardsUseCase`. |

### Future Enhancements (Post-MVP)
*   **WorkManager Integration:** For background syncing of study analytics or offline-queueing of AI generation requests.
*   **App Widgets:** Jetpack Glance widgets to display "Flashcard of the Day" on the Android home screen.
*   **Biometrics:** Securing specific sensitive decks using Androidx Biometric prompt.

---

## 3. Complete Screen & Navigation Hierarchy

### Navigation Graph (`NavHost`)
We will use Jetpack Navigation Compose with a Type-Safe routing approach (using Kotlin Serialization for destinations).

```kotlin
sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data class DeckDetail(val deckId: String) : Screen("deck_detail/{deckId}")
    data class StudySession(val deckId: String) : Screen("study_session/{deckId}")
}
```

### Screen Breakdown
1.  **`HomeScreen` (Route: `home`)**
    *   *ViewModel:* `HomeViewModel` (Fetches `Flow<List<Deck>>` from Repository).
    *   *Composables:* `Scaffold`, `TopAppBar`, `FloatingActionButton` (Triggers AI Generation), `LazyVerticalGrid` (Deck cards).
2.  **`DeckDetailScreen` (Route: `deck_detail/{deckId}`)**
    *   *ViewModel:* `DeckDetailViewModel` (Fetches specific Deck and its cards).
    *   *Composables:* List of cards in the deck, options to Edit/Delete, and a prominent "Start Studying" FAB.
3.  **`StudySessionScreen` (Route: `study_session/{deckId}`)**
    *   *ViewModel:* `StudyViewModel` (Manages current card index, tracks `isMastered` state).
    *   *Composables:* `HorizontalPager` containing `FlashcardItem`. `FlashcardItem` uses `graphicsLayer { rotationY = ... }` for the flip animation.

---

## 4. Data Models & Entity Schemas

We map the existing JSON/TypeScript structures into robust Room Entities.

```kotlin
// --- Entity: Deck ---
@Entity(tableName = "decks")
data class DeckEntity(
    @PrimaryKey val deckId: String = UUID.randomUUID().toString(),
    val name: String,
    val createdAt: Long = System.currentTimeMillis()
)

// --- Entity: Flashcard ---
@Entity(
    tableName = "flashcards",
    foreignKeys = [
        ForeignKey(
            entity = DeckEntity::class,
            parentColumns = ["deckId"],
            childColumns = ["deckOwnerId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("deckOwnerId")]
)
data class FlashcardEntity(
    @PrimaryKey val cardId: String = UUID.randomUUID().toString(),
    val deckOwnerId: String,
    val question: String, // Maps to "front"
    val answer: String,   // Maps to "back"
    val isMastered: Boolean = false
)

// --- Domain Model (Used by UI) ---
data class DeckWithCards(
    @Embedded val deck: DeckEntity,
    @Relation(
        parentColumn = "deckId",
        entityColumn = "deckOwnerId"
    )
    val cards: List<FlashcardEntity>
)
```

---

## 5. Native Android Configurations

### `build.gradle.kts` (App Level) Specifications
```kotlin
android {
    namespace = "com.sepfol.flashcards"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.sepfol.flashcards"
        minSdk = 26 // Support for modern Java 8 time APIs and up
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
}
```

### AndroidManifest.xml
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Required for AI Generation API Calls -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".SepFolApplication" <!-- Hilt Application class -->
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.SepFol">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 6. Step-by-Step Implementation Roadmap

### Phase 1: Gradle, Architecture Setup & DI (Week 1)
*   Initialize new Android Studio project with `build.gradle.kts` DSL.
*   Setup Version Catalogs (`libs.versions.toml`) for dependency management.
*   Integrate Dagger Hilt, setup `Application` class, and annotate `MainActivity`.
*   Establish directory structure: `data`, `domain`, `presentation`, `di`, `utils`.

### Phase 2: Core Data Layer & Room Integration (Week 1-2)
*   Define Room Entities (`DeckEntity`, `FlashcardEntity`).
*   Create DAOs with `Flow` return types for reactive database observation.
*   Implement `FlashcardRepository` and expose data to the Domain layer.
*   Setup Retrofit API Interface and Network Repository for the Gemini Flashcard generation endpoint.

### Phase 3: UI Layer, ViewModels & Jetpack Compose (Week 2-3)
*   Configure Material 3 Theme (Colors, Typography, Shapes).
*   Build `NavHost` and routing configuration.
*   Develop `HomeViewModel` and `HomeScreen` (Deck listing).
*   Develop `StudyViewModel` and `StudySessionScreen` (Card flipping logic and animations).
*   Develop AI Generation Modal and integrate with the Retrofit network call.

### Phase 4: Polish, Testing & CI/CD (Week 4)
*   Write Unit Tests for UseCases and ViewModels using `MockK` and `Turbine` (for Flow testing).
*   Write UI Tests for Compose components.
*   Configure GitHub Actions (similar to the current Web workflow) to run Lint, Unit Tests, and generate the Native Release APK/AAB.
*   Setup ProGuard/R8 rules for release obfuscation.
