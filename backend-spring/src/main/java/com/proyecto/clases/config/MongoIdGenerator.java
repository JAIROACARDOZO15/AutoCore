package com.proyecto.clases.config;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.Map;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

/** Assigns numeric ids to keep the existing REST API compatible after moving to MongoDB. */
@Component
public class MongoIdGenerator extends AbstractMongoEventListener<Object> {

    private final MongoTemplate mongoTemplate;

    public MongoIdGenerator(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void onBeforeConvert(BeforeConvertEvent<Object> event) {
        assignIds(event.getSource(), new IdentityHashMap<>());
    }

    private void assignIds(Object value, Map<Object, Boolean> visited) {
        if (value == null || visited.put(value, Boolean.TRUE) != null
                || !value.getClass().getName().startsWith("com.proyecto.clases.")) {
            return;
        }

        Field id = findField(value.getClass(), "id");
        if (id != null && id.getType() == Long.class) {
            try {
                id.setAccessible(true);
                if (id.get(value) == null) {
                    id.set(value, nextId(value.getClass().getSimpleName()));
                }
            } catch (ReflectiveOperationException ex) {
                throw new IllegalStateException("No se pudo asignar el id MongoDB", ex);
            }
        }
        setTimestamp(value, "createdAt");
        setTimestamp(value, "fechaRegistro");
        setTimestamp(value, "fechaIngreso");
        setTimestamp(value, "fechaCotizacion");
        setTimestamp(value, "fechaDiagnostico");

        for (Field field : value.getClass().getDeclaredFields()) {
            if (Modifier.isStatic(field.getModifiers()) || field.isAnnotationPresent(DBRef.class)) {
                continue;
            }
            try {
                field.setAccessible(true);
                Object nested = field.get(value);
                if (nested instanceof Collection<?> collection) {
                    collection.forEach(item -> assignIds(item, visited));
                } else {
                    assignIds(nested, visited);
                }
            } catch (ReflectiveOperationException ex) {
                throw new IllegalStateException("No se pudo preparar el documento MongoDB", ex);
            }
        }
    }

    private Long nextId(String type) {
        Document sequence = mongoTemplate.findAndModify(
                Query.query(Criteria.where("_id").is(type)),
                new Update().inc("value", 1),
                FindAndModifyOptions.options().upsert(true).returnNew(true),
                Document.class,
                "mongo_sequences");
        return ((Number) sequence.get("value")).longValue();
    }

    private void setTimestamp(Object value, String name) {
        Field field = findField(value.getClass(), name);
        if (field == null || field.getType() != LocalDateTime.class) {
            return;
        }
        try {
            field.setAccessible(true);
            if (field.get(value) == null) {
                field.set(value, LocalDateTime.now());
            }
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException("No se pudo asignar la fecha del documento", ex);
        }
    }

    private Field findField(Class<?> type, String name) {
        for (Class<?> current = type; current != null; current = current.getSuperclass()) {
            try {
                return current.getDeclaredField(name);
            } catch (NoSuchFieldException ignored) {
                // Continue through the class hierarchy.
            }
        }
        return null;
    }
}
