package com.freeclassroom.saleservice.entity.order;

import com.freeclassroom.saleservice.entity.AbstractEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@Table(name = "order_items")
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemEntity extends AbstractEntity {
    String courseId;
    Double price;

    @ManyToOne
    @JoinColumn(name = "order_id")
    OrderEntity order;
}
