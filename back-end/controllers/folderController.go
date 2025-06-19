package controllers

import (
	"strconv"

	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/gofiber/fiber/v2"
)

type FolderController struct {
	service *services.FolderService
}

func NewFolderController(service *services.FolderService) *FolderController {
	return &FolderController{service: service}
}

// @Summary Create a new folder
// @Description Create a new folder for organizing documents
// @Tags folders
// @Accept json
// @Produce json
// @Param folder body models.FolderCreate true "Folder data"
// @Success 201 {object} models.ApiResponse[models.Folder]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /folders [post]
func (c *FolderController) CreateFolder(ctx *fiber.Ctx) error {
	var folderCreate models.FolderCreate
	if err := ctx.BodyParser(&folderCreate); err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	userID := ctx.Locals("userID").(string)
	folder, err := c.service.CreateFolder(&folderCreate, userID)
	if err != nil {
		return ctx.Status(500).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.Status(201).JSON(models.ApiResponse[*models.Folder]{
		Success: true,
		Data:    folder,
		Message: "Folder created successfully",
	})
}

// @Summary Get all folders
// @Description Get all folders for the authenticated user
// @Tags folders
// @Produce json
// @Success 200 {object} models.ApiResponse[[]models.Folder]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /folders [get]
func (c *FolderController) GetAllFolders(ctx *fiber.Ctx) error {
	userID := ctx.Locals("userID").(string)
	folders, err := c.service.GetAllFolders(userID)
	if err != nil {
		return ctx.Status(500).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	// Ensure we never return nil, always return empty array
	if folders == nil {
		folders = []*models.Folder{}
	}

	return ctx.JSON(models.ApiResponse[[]*models.Folder]{
		Success: true,
		Data:    folders,
	})
}

// @Summary Get folder by ID
// @Description Get a specific folder by its ID
// @Tags folders
// @Produce json
// @Param id path int true "Folder ID"
// @Success 200 {object} models.ApiResponse[models.Folder]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 404 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /folders/{id} [get]
func (c *FolderController) GetFolder(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid folder ID",
		})
	}

	userID := ctx.Locals("userID").(string)
	folder, err := c.service.GetFolder(id, userID)
	if err != nil {
		return ctx.Status(404).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(models.ApiResponse[*models.Folder]{
		Success: true,
		Data:    folder,
	})
}

// @Summary Update folder
// @Description Update an existing folder
// @Tags folders
// @Accept json
// @Produce json
// @Param id path int true "Folder ID"
// @Param folder body models.FolderUpdate true "Updated folder data"
// @Success 200 {object} models.ApiResponse[models.Folder]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 404 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /folders/{id} [put]
func (c *FolderController) UpdateFolder(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid folder ID",
		})
	}

	var folderUpdate models.FolderUpdate
	if err := ctx.BodyParser(&folderUpdate); err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	userID := ctx.Locals("userID").(string)
	folder, err := c.service.UpdateFolder(id, &folderUpdate, userID)
	if err != nil {
		return ctx.Status(404).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(models.ApiResponse[*models.Folder]{
		Success: true,
		Data:    folder,
		Message: "Folder updated successfully",
	})
}

// @Summary Delete folder
// @Description Delete a folder and all its contents
// @Tags folders
// @Produce json
// @Param id path int true "Folder ID"
// @Success 200 {object} models.ApiResponse[interface{}]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 404 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /folders/{id} [delete]
func (c *FolderController) DeleteFolder(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid folder ID",
		})
	}

	userID := ctx.Locals("userID").(string)
	err = c.service.DeleteFolder(id, userID)
	if err != nil {
		return ctx.Status(404).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(models.ApiResponse[interface{}]{
		Success: true,
		Data:    nil,
		Message: "Folder deleted successfully",
	})
}

// @Summary Get folders by parent
// @Description Get all folders under a specific parent folder
// @Tags folders
// @Produce json
// @Param parentId query int false "Parent folder ID (omit for root folders)"
// @Success 200 {object} models.ApiResponse[[]models.Folder]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /folders/by-parent [get]
func (c *FolderController) GetFoldersByParent(ctx *fiber.Ctx) error {
	userID := ctx.Locals("userID").(string)
	
	var parentID *int
	if parentIDStr := ctx.Query("parentId"); parentIDStr != "" {
		if id, err := strconv.Atoi(parentIDStr); err == nil {
			parentID = &id
		}
	}

	folders, err := c.service.GetFoldersByParent(parentID, userID)
	if err != nil {
		return ctx.Status(500).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	// Ensure we never return nil, always return empty array
	if folders == nil {
		folders = []*models.Folder{}
	}

	return ctx.JSON(models.ApiResponse[[]*models.Folder]{
		Success: true,
		Data:    folders,
	})
}
