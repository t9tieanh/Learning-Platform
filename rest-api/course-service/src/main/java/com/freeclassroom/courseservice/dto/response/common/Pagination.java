package com.freeclassroom.courseservice.dto.response.common;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Pagination {
    int page;
    int size;
    long totalItems;
    int totalPages;
    boolean hasNext;
    boolean hasPrevious;
}
