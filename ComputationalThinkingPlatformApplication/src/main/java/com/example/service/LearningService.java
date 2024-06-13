package com.example.service;

import com.example.model.LearningRecord;
import com.example.repository.LearningRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningService {
    @Autowired
    private LearningRecordRepository learningRecordRepository;

    public LearningRecord save(LearningRecord record) {
        return learningRecordRepository.save(record);
    }

    public List<LearningRecord> findByUserId(Long userId) {
        return learningRecordRepository.findByUserId(userId);
    }
}