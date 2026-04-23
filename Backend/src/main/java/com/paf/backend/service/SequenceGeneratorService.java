package com.paf.backend.service;

import com.paf.backend.model.DatabaseSequence;
import static org.springframework.data.mongodb.core.FindAndModifyOptions.options;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class SequenceGeneratorService {

    private final MongoOperations mongoOperations;

    public SequenceGeneratorService(MongoOperations mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    public long generateSequence(String sequenceName) {
        Query query = new Query(Criteria.where("_id").is(sequenceName));
        Update update = new Update().inc("seq", 1);

        DatabaseSequence counter = mongoOperations.findAndModify(
                query,
                update,
                options().returnNew(true).upsert(true),
                DatabaseSequence.class
        );

        return counter == null ? 1L : counter.getSeq();
    }
}