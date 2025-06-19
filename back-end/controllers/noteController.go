package controllers

import (
	"strconv"

	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/gofiber/fiber/v2"
)

type NoteController struct {
	service *services.NoteService
}

func NewNoteController(service *services.NoteService) *NoteController {
	return &NoteController{service: service}
}

// @Summary Create a new note
// @Description Create a new note/document
// @Tags notes
// @Accept json
// @Produce json
// @Param note body models.NoteCreate true "Note data"
// @Success 201 {object} models.ApiResponse[models.Note]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /notes [post]
func (c *NoteController) CreateNote(ctx *fiber.Ctx) error {
	var noteCreate models.NoteCreate
	if err := ctx.BodyParser(&noteCreate); err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	userID := ctx.Locals("userID").(string)
	note, err := c.service.CreateNote(&noteCreate, userID)
	if err != nil {
		return ctx.Status(500).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.Status(201).JSON(models.ApiResponse[*models.Note]{
		Success: true,
		Data:    note,
		Message: "Note created successfully",
	})
}

// @Summary Get all notes
// @Description Get all notes for the authenticated user
// @Tags notes
// @Produce json
// @Success 200 {object} models.ApiResponse[[]models.Note]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /notes [get]
func (c *NoteController) GetAllNotes(ctx *fiber.Ctx) error {
	userID := ctx.Locals("userID").(string)
	notes, err := c.service.GetAllNotes(userID)
	if err != nil {
		return ctx.Status(500).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	// Ensure we never return nil, always return empty array
	if notes == nil {
		notes = []*models.Note{}
	}

	return ctx.JSON(models.ApiResponse[[]*models.Note]{
		Success: true,
		Data:    notes,
	})
}

// @Summary Get note by ID
// @Description Get a specific note by its ID
// @Tags notes
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} models.ApiResponse[models.Note]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 404 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /notes/{id} [get]
func (c *NoteController) GetNote(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid note ID",
		})
	}

	userID := ctx.Locals("userID").(string)
	note, err := c.service.GetNote(id, userID)
	if err != nil {
		return ctx.Status(404).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(models.ApiResponse[*models.Note]{
		Success: true,
		Data:    note,
	})
}

// @Summary Update note
// @Description Update an existing note
// @Tags notes
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Param note body models.NoteUpdate true "Updated note data"
// @Success 200 {object} models.ApiResponse[models.Note]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 404 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /notes/{id} [put]
func (c *NoteController) UpdateNote(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid note ID",
		})
	}

	var noteUpdate models.NoteUpdate
	if err := ctx.BodyParser(&noteUpdate); err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	userID := ctx.Locals("userID").(string)
	note, err := c.service.UpdateNote(id, &noteUpdate, userID)
	if err != nil {
		return ctx.Status(404).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(models.ApiResponse[*models.Note]{
		Success: true,
		Data:    note,
		Message: "Note updated successfully",
	})
}

// @Summary Delete note
// @Description Delete a note
// @Tags notes
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} models.ApiResponse[interface{}]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 404 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /notes/{id} [delete]
func (c *NoteController) DeleteNote(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(400).JSON(models.ApiErrorResponse{
			Success: false,
			Message: "Invalid note ID",
		})
	}

	userID := ctx.Locals("userID").(string)
	err = c.service.DeleteNote(id, userID)
	if err != nil {
		return ctx.Status(404).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(models.ApiResponse[interface{}]{
		Success: true,
		Data:    nil,
		Message: "Note deleted successfully",
	})
}

// @Summary Get notes by folder
// @Description Get all notes in a specific folder
// @Tags notes
// @Produce json
// @Param folderId query int false "Folder ID (omit for root notes)"
// @Success 200 {object} models.ApiResponse[[]models.Note]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /notes/by-folder [get]
func (c *NoteController) GetNotesByFolder(ctx *fiber.Ctx) error {
	userID := ctx.Locals("userID").(string)
	
	var folderID *int
	if folderIDStr := ctx.Query("folderId"); folderIDStr != "" {
		if id, err := strconv.Atoi(folderIDStr); err == nil {
			folderID = &id
		}
	}

	notes, err := c.service.GetNotesByFolder(folderID, userID)
	if err != nil {
		return ctx.Status(500).JSON(models.ApiErrorResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	// Ensure we never return nil, always return empty array
	if notes == nil {
		notes = []*models.Note{}
	}

	return ctx.JSON(models.ApiResponse[[]*models.Note]{
		Success: true,
		Data:    notes,
	})
}
