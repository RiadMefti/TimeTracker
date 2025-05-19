package controllers

import (
	"strconv"

	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/RiadMefti/TimeTracker/back-end/utils"
	"github.com/gofiber/fiber/v2"
)

type TimeEntryController struct {
	timeEntryService *services.TimeEntryService
}

func NewTimeEntryController(timeEntryService *services.TimeEntryService) *TimeEntryController {
	return &TimeEntryController{
		timeEntryService: timeEntryService,
	}
}

// @Summary Get all user time entries
// @Description Retrieve all time entries for the authenticated user
// @Tags time-entries
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.ApiResponse[[]models.TimeEntry]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-entries/ [get]
func (t *TimeEntryController) GetUserTimeEntries(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	entries, err := t.timeEntryService.GetUserTimeEntries(userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while retrieving time entries"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time entries retrieved successfully"))
}

// @Summary Create a new time entry
// @Description Create a new time entry for the authenticated user
// @Tags time-entries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param timeEntry body models.TimeEntryCreate true "Time entry to create"
// @Success 200 {object} models.ApiResponse[[]models.TimeEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-entries/ [post]
func (t *TimeEntryController) CreateTimeEntry(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	var entryToCreate models.TimeEntryCreate
	if err := c.BodyParser(&entryToCreate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}

	entries, err := t.timeEntryService.CreateTimeEntry(entryToCreate, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while creating time entry"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time entry created successfully"))
}

// @Summary Update a time entry
// @Description Update an existing time entry for the authenticated user
// @Tags time-entries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param timeEntry body models.TimeEntry true "Time entry to update"
// @Success 200 {object} models.ApiResponse[[]models.TimeEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-entries/ [put]
func (t *TimeEntryController) UpdateTimeEntry(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	var entryToUpdate models.TimeEntry
	if err := c.BodyParser(&entryToUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}

	entries, err := t.timeEntryService.UpdateTimeEntry(entryToUpdate, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while updating time entry"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time entry updated successfully"))
}

// @Summary Delete a time entry
// @Description Delete a time entry by ID for the authenticated user
// @Tags time-entries
// @Produce json
// @Security BearerAuth
// @Param id path int true "Time Entry ID"
// @Success 200 {object} models.ApiResponse[[]models.TimeEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-entries/{id} [delete]
func (t *TimeEntryController) DeleteTimeEntry(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	idStr := c.Params("id")
	timeEntryID, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid time entry ID"))
	}

	entries, err := t.timeEntryService.DeleteTimeEntry(timeEntryID, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while deleting time entry"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Time entry deleted successfully"))
}

// @Summary Assign a project to a time entry
// @Description Assign or unassign a project to a time entry for the authenticated user
// @Tags time-entries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Time Entry ID"
// @Param project body models.AssignProjectPayload true "Project assignment payload"
// @Success 200 {object} models.ApiResponse[[]models.TimeEntry]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /time-entries/{id}/assign-project [patch]
func (t *TimeEntryController) AssignProjectToTime(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	idStr := c.Params("id")
	timeEntryID, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid time entry ID"))
	}

	var payload models.AssignProjectPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}

	entries, err := t.timeEntryService.AssignProjectToTime(timeEntryID, payload.ProjectID, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while assigning project"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, entries, "Project assigned to time entry successfully"))
}
