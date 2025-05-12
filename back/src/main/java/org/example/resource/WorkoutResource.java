package org.example.resource;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*; // Import Firestore classes
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject; // Add Inject import
// import jakarta.transaction.Transactional; // Not needed
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.entity.Exercise; // Keep Exercise import if needed for response mapping
import org.example.entity.WorkoutLog;
import org.slf4j.Logger; // Add Logger
import org.slf4j.LoggerFactory; // Add LoggerFactory

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Path("/workout")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WorkoutResource {

    private static final Logger log = LoggerFactory.getLogger(WorkoutResource.class); // Add logger
    private static final String EXERCISES_COLLECTION = "exercises";
    private static final String WORKOUT_LOGS_COLLECTION = "workout_logs";

    @Inject
    Firestore firestore; // Inject Firestore client

    @POST
    @Path("/get")
    // @Transactional // Not needed
    public Response getWorkoutLogs(UserRequest request) {
        if (request == null || request.user_id == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("user_id is required").build();
        }
        log.info("Fetching workout logs for user_id: {}", request.user_id);
        try {
            CollectionReference logsCollection = firestore.collection(WORKOUT_LOGS_COLLECTION);
            Query query = logsCollection.whereEqualTo("user_id", request.user_id);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();

            List<WorkoutLog> logs = querySnapshot.get().getDocuments().stream()
                    .map(doc -> {
                        WorkoutLog workoutLog = doc.toObject(WorkoutLog.class);
                        // workoutLog.log_id = doc.getId(); // ID is already mapped by @DocumentId
                        log.debug("Fetched log: {}", workoutLog.log_id);
                        // If you need the full Exercise object in the response:
                        // try {
                        //     if (workoutLog.exerciseId != null) {
                        //         DocumentReference exerciseRef = firestore.collection(EXERCISES_COLLECTION).document(workoutLog.exerciseId);
                        //         ApiFuture<DocumentSnapshot> exerciseFuture = exerciseRef.get();
                        //         DocumentSnapshot exerciseSnapshot = exerciseFuture.get();
                        //         if (exerciseSnapshot.exists()) {
                        //             workoutLog.exercise = exerciseSnapshot.toObject(Exercise.class);
                        //             // workoutLog.exercise.exercise_id = exerciseSnapshot.getId(); // Ensure ID is set
                        //         } else {
                        //              log.warn("Exercise document not found for ID: {}", workoutLog.exerciseId);
                        //         }
                        //     }
                        // } catch (InterruptedException | ExecutionException e) {
                        //     log.error("Error fetching related exercise for log {}", workoutLog.log_id, e);
                        //     Thread.currentThread().interrupt();
                        // }
                        return workoutLog;
                    })
                    .collect(Collectors.toList());

            log.info("Found {} logs for user_id: {}", logs.size(), request.user_id);
            return Response.ok(logs).build();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error fetching workout logs for user_id: {}", request.user_id, e);
            Thread.currentThread().interrupt(); // Restore interrupted status
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error fetching workout logs: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/insert")
    // @Transactional // Not needed
    public Response addWorkoutLog(WorkoutLogRequest request) {
        if (request == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Request body is required").build();
        }
        if (request.exercise_id == null || request.exercise_id.isBlank()) { // Check for blank ID
             return Response.status(Response.Status.BAD_REQUEST).entity("exercise_id is required and cannot be blank").build();
        }
        log.info("Attempting to insert workout log for user_id: {}, exercise_id: {}", request.user_id, request.exercise_id);

        try {
            // Check if the exercise exists
            DocumentReference exerciseRef = firestore.collection(EXERCISES_COLLECTION).document(request.exercise_id);
            ApiFuture<DocumentSnapshot> exerciseFuture = exerciseRef.get();
            DocumentSnapshot exerciseSnapshot = exerciseFuture.get();

            if (!exerciseSnapshot.exists()) {
                log.warn("Invalid exercise_id provided: {}", request.exercise_id);
                return Response.status(Response.Status.BAD_REQUEST).entity("Invalid exercise_id: " + request.exercise_id).build();
            }
            // Optional: Get the Exercise object if needed for validation or other logic
            // Exercise exercise = exerciseSnapshot.toObject(Exercise.class);

            WorkoutLog newLog = new WorkoutLog();
            newLog.user_id = request.user_id;
            newLog.workout_date = request.workout_date;
            newLog.exerciseId = request.exercise_id; // Set the ID directly
            newLog.weight = request.weight;
            newLog.repetitions = request.repetitions;
            newLog.rm = request.rm;

            // Add the new log, Firestore generates the ID
            ApiFuture<DocumentReference> addedDocRef = firestore.collection(WORKOUT_LOGS_COLLECTION).add(newLog);
            String generatedId = addedDocRef.get().getId();
            newLog.log_id = generatedId; // Get the generated ID and set it back

            log.info("Successfully inserted workout log with ID: {}", generatedId);
            return Response.status(Response.Status.CREATED).entity(newLog).build();

        } catch (InterruptedException | ExecutionException e) {
             log.error("Error adding workout log for user_id: {}", request.user_id, e);
             Thread.currentThread().interrupt(); // Restore interrupted status
             return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error adding workout log: " + e.getMessage()).build();
        }
    }

    // Inner class for /get request body
    public static class UserRequest {
        public String user_id;
    }

    // Inner class for /insert request body
    public static class WorkoutLogRequest {
        public String user_id;
        public String workout_date;
        public String exercise_id; // Keep as String
        public Double weight;
        public Integer repetitions;
        public Double rm;
    }
}