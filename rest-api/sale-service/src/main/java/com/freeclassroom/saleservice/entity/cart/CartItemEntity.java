package com.freeclassroom.saleservice.entity.cart;

import com.freeclassroom.saleservice.entity.AbstractEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@Table(name = "cart_items")
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemEntity extends AbstractEntity {
    @ManyToOne
    @JoinColumn(name = "cart_id")
    CartEntity cart;

    @Column(nullable = false)
    String courseId;

    int quantity;

    Double price;
}
