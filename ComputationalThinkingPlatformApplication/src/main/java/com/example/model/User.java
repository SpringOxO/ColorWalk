package com.example.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @TableId(type= IdType.AUTO)
    private int id;
    private String username;
    private String password;
    private String email;
    private int zone_passed = 0;
}