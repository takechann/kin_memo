package org.example.resource;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.entity.Exercise; // Exercise をインポート
import org.example.entity.WorkoutLog;

import java.time.LocalDate; // LocalDate をインポート
import java.util.List;

@Path("/workout")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WorkoutResource {

    @POST
    @Path("/get")
    @Transactional
    public Response getWorkoutLogs(UserRequest request) {
        if (request == null || request.user_id == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("user_id is required").build();
        }
        List<WorkoutLog> logs = WorkoutLog.find("user_id", request.user_id).list();
        return Response.ok(logs).build();
    }

    @POST
    @Path("/insert")
    @Transactional
    public Response addWorkoutLog(WorkoutLogRequest request) {
        if (request == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Request body is required").build();
        }

        Exercise exercise = Exercise.findById(request.exercise_id);
        if (exercise == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid exercise_id: " + request.exercise_id).build();
        }

        WorkoutLog log = new WorkoutLog();
        log.user_id = request.user_id;
        log.workout_date = request.workout_date;
        log.exercise = exercise;
        log.weight = request.weight;
        log.repetitions = request.repetitions;
        log.rm = request.rm;

        log.persist();
        return Response.status(Response.Status.CREATED).entity(log).build();
    }

    // Inner class for /get request body
    public static class UserRequest {
        public Integer user_id;
    }

    // Inner class for /insert request body
    public static class WorkoutLogRequest {
        public Integer user_id;
        public LocalDate workout_date;
        public Long exercise_id;
        public Double weight;
        public Integer repetitions;
        public Double rm;
    }
}