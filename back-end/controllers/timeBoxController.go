package controllers

import (
	"strconv"

	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/RiadMefti/TimeTracker/back-end/utils"
	"github.com/gofiber/fiber/v2"
)

type TimeBoxEntryController struct {
	timeBoxEntryService *services.TimeBoxEntryService
}

func NewTimeBoxEntryController(timeBoxEntryService *services.TimeBoxEntryService) *TimeBoxEntryController {
	return &TimeBoxEntryController{
		timeBoxEntryService: timeBoxEntryService,
	}
}

// @Summary Get all user time box entries
// @Description Retrieve all time box entries for the authenticated user
// @Tags time-box-entries
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.ApiResponse[[]models.TimeBoxEntry]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-box-entries/ [get]
func (t *TimeBoxEntryController) GetUserTimeBoxEntries(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	entries, err := t.timeBoxEntryService.GetUserTimeBoxEntries(userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while retrieving time box entries"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time box entries retrieved successfully"))
}

// @Summary Create a new time box entry
// @Description Create a new time box entry for the authenticated user
// @Tags time-box-entries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param timeBoxEntry body models.TimeBoxEntryCreate true "Time box entry to create"
// @Success 200 {object} models.ApiResponse[[]models.TimeBoxEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-box-entries/ [post]
func (t *TimeBoxEntryController) CreateTimeBoxEntry(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	var entryToCreate models.TimeBoxEntryCreate
	if err := c.BodyParser(&entryToCreate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}

	entries, err := t.timeBoxEntryService.CreateTimeBoxEntry(entryToCreate, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while creating time box entry"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time box entry created successfully"))
}

// @Summary Update a time box entry
// @Description Update an existing time box entry for the authenticated user
// @Tags time-box-entries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param timeBoxEntry body models.TimeBoxEntry true "Time box entry to update"
// @Success 200 {object} models.ApiResponse[[]models.TimeBoxEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-box-entries/ [put]
func (t *TimeBoxEntryController) UpdateTimeBoxEntry(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	var entryToUpdate models.TimeBoxEntry
	if err := c.BodyParser(&entryToUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}

	entries, err := t.timeBoxEntryService.UpdateTimeBoxEntry(entryToUpdate, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while updating time box entry"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time box entry updated successfully"))
}

// @Summary Delete a time box entry
// @Description Delete a time box entry by ID for the authenticated user
// @Tags time-box-entries
// @Produce json
// @Security BearerAuth
// @Param id path int true "Time Box Entry ID"
// @Success 200 {object} models.ApiResponse[[]models.TimeBoxEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-box-entries/{id} [delete]
func (t *TimeBoxEntryController) DeleteTimeBoxEntry(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	idStr := c.Params("id")
	timeBoxEntryID, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid time box entry ID"))
	}

	entries, err := t.timeBoxEntryService.DeleteTimeBoxEntry(timeBoxEntryID, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while deleting time box entry"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time box entry deleted successfully"))
}

// @Summary Assign a project to a time box entry
// @Description Assign or unassign a project to a time box entry for the authenticated user
// @Tags time-box-entries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Time Box Entry ID"
// @Param project body models.AssignProjectPayload true "Project assignment payload"
// @Success 200 {object} models.ApiResponse[[]models.TimeBoxEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-box-entries/{id}/assign-project [patch]
func (t *TimeBoxEntryController) AssignProjectToTimeBox(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	idStr := c.Params("id")
	timeBoxEntryID, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid time box entry ID"))
	}

	var payload models.AssignProjectPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}

	entries, err := t.timeBoxEntryService.AssignProjectToTimeBox(timeBoxEntryID, payload.ProjectID, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while assigning project"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Project assigned to time box entry successfully"))
}
