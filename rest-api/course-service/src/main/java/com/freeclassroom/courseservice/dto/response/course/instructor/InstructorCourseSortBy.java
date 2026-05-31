package com.freeclassroom.courseservice.dto.response.course.instructor;

public enum InstructorCourseSortBy {
    LATEST,
    RATING,
    STUDENTS,
    BEST_SELLER;

    public static InstructorCourseSortBy from(String value) {
        if (value == null || value.isBlank()) return LATEST;
        return switch (value.trim().toLowerCase()) {
            case "latest" -> LATEST;
            case "rating" -> RATING;
            case "students" -> STUDENTS;
            case "bestseller", "best_seller", "best-seller" -> BEST_SELLER;
            default -> LATEST;
        };
    }
}
