package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class LessonStudentService implements ILessonStudentService {
    EnrollmentRepository enrollmentRepo;
    LessonRepository lessonRepo;

    @Override
    public boolean canViewLesson(String lessonId, String userId) {
        boolean result = enrollmentRepo.existsByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId);
        if (!result)
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        return true;
    }
}
