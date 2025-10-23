package com.freeclassroom.saleservice.entity.order;

import com.freeclassroom.saleservice.entity.AbstractEntity;
import com.freeclassroom.saleservice.enums.entity.PaymentMethod;
import com.freeclassroom.saleservice.enums.entity.PaymentStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@Table(name = "payments")
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class PaymentEntity extends AbstractEntity {
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    OrderEntity order;

    @Enumerated(EnumType.STRING)
    PaymentMethod method;

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    LocalDateTime createdAt;
}
