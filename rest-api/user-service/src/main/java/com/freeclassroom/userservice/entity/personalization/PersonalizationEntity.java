package com.freeclassroom.userservice.entity.personalization;

import com.freeclassroom.userservice.entity.AbstractEntity;
import com.freeclassroom.userservice.entity.personalization.converter.StringListJsonConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "personalization")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PersonalizationEntity extends AbstractEntity {

    @Column(name = "user_id", nullable = false, unique = true, length = 64)
    String userId;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "list_category", columnDefinition = "TEXT")
    List<String> listCategory;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "list_tag", columnDefinition = "TEXT")
    List<String> listTag;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "list_long_des", columnDefinition = "TEXT")
    List<String> listLongDes;
}
