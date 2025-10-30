package com.freeclassroom.courseservice.dto.response.common;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PagingResponse<T> {
    private List<T> items;
    private Pagination pagination;
}
