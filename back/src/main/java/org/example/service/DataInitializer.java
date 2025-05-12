package org.example.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*; // Import Firestore classes
import io.quarkus.runtime.Startup;
import jakarta.annotation.PostConstruct; // Use PostConstruct for startup logic
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.example.entity.Exercise;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Startup // Ensure this bean is created at startup
@ApplicationScoped
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String EXERCISE_INIT_FLAG = "exercise_data_initialized";
    private static final String FLAGS_COLLECTION = "initializationFlags";
    private static final String EXERCISES_COLLECTION = "exercises";

    @Inject
    Firestore firestore; // Inject Firestore client

    // Use PostConstruct to trigger initialization after injection
    @PostConstruct
    void initialize() {
        log.info("DataInitializer開始");
        // try {
        //     initializeData();
        // } catch (ExecutionException | InterruptedException e) {
        //     log.error("Failed to initialize Firestore data", e);
        //     // Restore interrupted state
        //     Thread.currentThread().interrupt();
        // }
    }

    // // No @Transactional needed
    // public void initializeData() throws ExecutionException, InterruptedException {
    //     log.info("Checking if initial data needs to be loaded...");

    //     CollectionReference flagsCollection = firestore.collection(FLAGS_COLLECTION);
    //     // Use the flag name as the document ID for simplicity and uniqueness guarantee
    //     DocumentReference flagDocRef = flagsCollection.document(EXERCISE_INIT_FLAG);
    //     ApiFuture<DocumentSnapshot> flagFuture = flagDocRef.get();
    //     DocumentSnapshot flagSnapshot = flagFuture.get();

    //     InitializationFlag flag;
    //     boolean needsInitialization = false;

    //     if (flagSnapshot.exists()) {
    //         flag = flagSnapshot.toObject(InitializationFlag.class);
    //         // Ensure flagId is set if it wasn't persisted before or is null
    //         if (flag != null) {
    //              flag.flagId = flagSnapshot.getId(); // Set ID from snapshot
    //              if (!flag.initialized) {
    //                  needsInitialization = true;
    //                  log.info("Initialization flag found but not marked as initialized.");
    //              } else {
    //                  log.info("Initialization flag found and already marked as initialized.");
    //              }
    //         } else {
    //              // Handle case where document exists but cannot be mapped
    //              log.warn("Initialization flag document {} exists but could not be mapped to object. Assuming initialization is needed.", EXERCISE_INIT_FLAG);
    //              flag = new InitializationFlag(EXERCISE_INIT_FLAG);
    //              flag.flagId = EXERCISE_INIT_FLAG;
    //              needsInitialization = true;
    //         }

    //     } else {
    //         // Flag document doesn't exist, create it and mark for initialization
    //         log.info("Initialization flag document not found. Creating and marking for initialization.");
    //         flag = new InitializationFlag(EXERCISE_INIT_FLAG);
    //         flag.flagId = EXERCISE_INIT_FLAG; // Use the constant name as ID
    //         flag.initialized = false; // Explicitly set to false before first save
    //         flagDocRef.set(flag).get(); // Create the document
    //         needsInitialization = true;
    //     }


    //     if (needsInitialization) {
    //         log.info("Loading initial exercise data...");
    //         CollectionReference exercisesCollection = firestore.collection(EXERCISES_COLLECTION);

    //         List<Exercise> initialExercises = List.of(
    //                 new Exercise("ベンチプレス", "胸"),
    //                 new Exercise("インクラインプレス", "胸"),
    //                 new Exercise("ショルダープレス", "肩"),
    //                 new Exercise("ラテラルレイズ", "肩"),
    //                 new Exercise("アームカール", "腕"),
    //                 new Exercise("ラットプルダウン", "背中"),
    //                 new Exercise("デッドリフト", "背中"),
    //                 new Exercise("スクワット", "脚"),
    //                 new Exercise("レッグプレス", "脚"),
    //                 new Exercise("レッグエクステンション", "脚"),
    //                 new Exercise("レッグカール", "脚"),
    //                 new Exercise("アブドミナル", "腹筋"),
    //                 new Exercise("ダンベルプレス", "胸"),
    //                 new Exercise("チェストインクラインプレス", "胸")
    //         );

    //         // Use batch writer for efficiency
    //         WriteBatch batch = firestore.batch();
    //         int exercisesAdded = 0;

    //         for (Exercise exercise : initialExercises) {
    //             // Check if exercise with the same name already exists
    //              Query exerciseQuery = exercisesCollection.whereEqualTo("name", exercise.name).limit(1);
    //              ApiFuture<QuerySnapshot> exerciseQuerySnapshot = exerciseQuery.get();
    //              if (exerciseQuerySnapshot.get().isEmpty()) {
    //                 // Let Firestore generate the ID for new exercises
    //                 DocumentReference newExerciseRef = exercisesCollection.document(); // Create ref with auto-ID
    //                 exercise.exercise_id = newExerciseRef.getId(); // Assign the auto-generated ID back to the object
    //                 batch.set(newExerciseRef, exercise); // Add set operation to batch
    //                 exercisesAdded++;
    //                 log.debug("Adding exercise to batch: {}", exercise.name);
    //              } else {
    //                 log.debug("Exercise already exists, skipping: {}", exercise.name);
    //              }
    //         }

    //         // Commit the batch of exercise additions
    //         if (exercisesAdded > 0) {
    //             ApiFuture<List<WriteResult>> batchFuture = batch.commit();
    //             batchFuture.get(); // Wait for batch completion
    //             log.info("Added {} initial exercises.", exercisesAdded);
    //         } else {
    //              log.info("No new exercises to add.");
    //         }


    //         // Update the initialization flag to true
    //         flag.initialized = true;
    //         ApiFuture<WriteResult> updateResult = flagDocRef.set(flag); // Update the flag document
    //         log.info("Marking initialization as complete. Update time: {}", updateResult.get().getUpdateTime());
    //     } else {
    //         log.info("Initial data already loaded or flag indicates no initialization needed.");
    //     }
    // }
}