package com.freeclassroom.saleservice.entity.discount;

import com.freeclassroom.saleservice.entity.AbstractEntity;
import com.freeclassroom.saleservice.enums.entity.DiscountType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@Table(name = "discounts")
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscountEntity extends AbstractEntity {
    String name;
    String code;
    String value;

    @Enumerated(EnumType.STRING)
    DiscountType type;
    Double minOrderValue;
    Double maxDiscount;

    LocalDateTime startDate;
    LocalDateTime endDate;
}
