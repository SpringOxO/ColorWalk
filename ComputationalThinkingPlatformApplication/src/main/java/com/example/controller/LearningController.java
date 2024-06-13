package com.example.controller;

import com.example.model.LearningRecord;
import com.example.service.LearningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/learning")
public class LearningController {
    @Autowired
    private LearningService learningService;

    @PostMapping("/save")
    public LearningRecord save(@RequestBody LearningRecord record) {
        return learningService.save(record);
    }

    @GetMapping("/records/{userId}")
    public List<LearningRecord> getRecords(@PathVariable Long userId) {
        return learningService.findByUserId(userId);
    }
}