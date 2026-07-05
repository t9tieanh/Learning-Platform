package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.configuration.CourseLimitsProperties;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonLimitValidator {
    ChapterRepository chapterRepository;
    CourseRepository courseRepository;
    CourseLimitsProperties limitsProperties;

    public void assertCanAddLesson(ChapterEntity chapter) {
        assertCanAddLesson(chapter.getId(), chapter.getCourse().getId());
    }

    public void assertCanAddLesson(String chapterId, String courseId) {
        long chapterLessonCount = chapterRepository.countLessonsByChapterId(chapterId);
        if (chapterLessonCount >= limitsProperties.getMaxLessonsPerChapter()) {
            throw new CustomExeption(ErrorCode.CHAPTER_LESSON_LIMIT_EXCEEDED);
        }

        long courseLessonCount = courseRepository.countLessonsByCourseId(courseId);
        if (courseLessonCount >= limitsProperties.getMaxLessonsPerCourse()) {
            throw new CustomExeption(ErrorCode.COURSE_LESSON_LIMIT_EXCEEDED);
        }
    }
}
