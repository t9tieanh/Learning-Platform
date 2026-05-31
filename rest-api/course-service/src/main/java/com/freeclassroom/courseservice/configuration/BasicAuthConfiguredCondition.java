package com.freeclassroom.courseservice.configuration;

import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

public class BasicAuthConfiguredCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        BasicAuthProperties props = Binder.get(context.getEnvironment())
                .bind("app.basic-auth", Bindable.of(BasicAuthProperties.class))
                .orElse(new BasicAuthProperties());

        if (!props.isEnabled()) {
            return false;
        }

        boolean hasCredentials = StringUtils.hasText(props.getUsername()) && StringUtils.hasText(props.getPassword());
        boolean hasPaths = !CollectionUtils.isEmpty(props.getPaths());

        return hasCredentials && hasPaths;
    }
}
