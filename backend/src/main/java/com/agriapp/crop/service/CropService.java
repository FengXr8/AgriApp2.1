package com.agriapp.crop.service;

import com.agriapp.crop.dto.CropDTO;
import com.agriapp.crop.repository.CropRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Profile("local")
public class CropService {

    private final CropRepository cropRepository;

    public CropService(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    public List<CropDTO> getAllCrops() {
        return cropRepository.findAllNotDeleted();
    }
}
