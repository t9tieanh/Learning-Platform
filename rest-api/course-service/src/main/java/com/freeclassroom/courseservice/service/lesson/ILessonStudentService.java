package com.freeclassroom.courseservice.service.lesson;

public interface ILessonStudentService {
    boolean canViewLesson(String lessonId, String userId);
}
