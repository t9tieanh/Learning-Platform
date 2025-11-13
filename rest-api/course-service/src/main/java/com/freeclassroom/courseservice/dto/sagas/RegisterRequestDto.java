package com.freeclassroom.courseservice.dto.sagas;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegisterRequestDto {
    private String orderId;
    private String userId;
    private int amount;
    private List<Item> items;

    public static class Item {
        private String course_id;
        private int price;

        public String getCourse_id() { return course_id; }
        public void setCourse_id(String course_id) { this.course_id = course_id; }

        public int getPrice() { return price; }
        public void setPrice(int price) { this.price = price; }
    }
}
