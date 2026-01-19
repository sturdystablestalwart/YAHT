import { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Text,
  Flex,
  Portal,
  CloseButton,
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  Spinner,
  NativeSelect,
} from "@chakra-ui/react";
import { CiSettings } from "react-icons/ci";
import { FaChevronRight, FaArrowLeft, FaTrash } from "react-icons/fa";
import { useColorModeValue } from "./ui/color-mode.jsx";
import { habitsAPI } from "../services/api";
import DeleteConfirmDialog from "./DeleteConfirmDialog.jsx";

const periodOptions = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

function ManageModal({ onHabitUpdated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editTimesPerPeriod, setEditTimesPerPeriod] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const bgColor = useColorModeValue("#e0e0e0", "#1a1a1a");
  const textColor = useColorModeValue("#333333ff", "#cececeff");
  const borderColor = useColorModeValue("#a1a1aa", "#27272a");
  const hoverBorderColor = useColorModeValue("#666666", "#888888");

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const data = await habitsAPI.getAll();
      setHabits(data);
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHabits();
      setSelectedHabit(null);
    }
  }, [isOpen]);

  const parseFrequency = (frequency) => {
    // Handle new structured format { target, period }
    if (frequency && typeof frequency === "object") {
      return {
        times: String(frequency.target || 1),
        period: frequency.period || "day",
      };
    }
    // Handle legacy string format "3 per day"
    const match = frequency?.match(/(\d+)\s*per\s*(\w+)/i);
    if (match) {
      return { times: match[1], period: match[2].toLowerCase() };
    }
    return { times: "1", period: "day" };
  };

  const handleSelectHabit = (habit) => {
    setSelectedHabit(habit);
    setEditTitle(habit.title);
    const { times, period } = parseFrequency(habit.frequency);
    setEditTimesPerPeriod(times);
    setEditPeriod(period);
    setEditDescription(habit.description || "");
    setError("");
  };

  const handleBack = () => {
    setSelectedHabit(null);
    setError("");
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setError("Please enter a habit name");
      return;
    }

    if (!editTimesPerPeriod || !editPeriod) {
      setError("Please specify frequency");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const frequency = {
        target: parseInt(editTimesPerPeriod, 10),
        period: editPeriod,
      };
      await habitsAPI.update(selectedHabit._id, {
        title: editTitle.trim(),
        frequency,
        description: editDescription.trim() || undefined,
        active: selectedHabit.active,
      });

      await fetchHabits();
      setSelectedHabit(null);

      if (onHabitUpdated) {
        onHabitUpdated();
      }
    } catch (err) {
      setError(err.message || "Failed to update habit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await habitsAPI.delete(selectedHabit._id);
      setShowDeleteConfirm(false);
      await fetchHabits();
      setSelectedHabit(null);

      if (onHabitUpdated) {
        onHabitUpdated();
      }
    } catch (err) {
      setError(err.message || "Failed to delete habit");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <Dialog.Trigger asChild>
          <Flex
            p={10}
            borderRadius="md"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            borderWidth={2}
            borderColor="transparent"
            transition="border-color 0.3s ease"
            _hover={{ borderColor: hoverBorderColor }}
          >
            <CiSettings
              style={{
                width: "30%",
                height: "30%",
                color: textColor,
              }}
            />
          </Flex>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />
          <Dialog.Positioner>
            <Dialog.Content
              bg={bgColor}
              borderRadius="xl"
              maxW="500px"
              w="90vw"
              maxH="80vh"
              overflow="hidden"
            >
              <Dialog.Header p={4} borderBottomWidth={1}>
                <Flex justify="space-between" align="center">
                  {selectedHabit ? (
                    <HStack>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        p={1}
                      >
                        <FaArrowLeft />
                      </Button>
                      <Dialog.Title color={textColor} fontSize="xl" fontWeight="bold">
                        Edit Habit
                      </Dialog.Title>
                    </HStack>
                  ) : (
                    <Dialog.Title color={textColor} fontSize="xl" fontWeight="bold">
                      Manage Habits
                    </Dialog.Title>
                  )}
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body p={4} overflowY="auto" maxH="60vh">
                {loading ? (
                  <Flex justify="center" p={8}>
                    <Spinner size="lg" color={textColor} />
                  </Flex>
                ) : selectedHabit ? (
                  // Edit View
                  <VStack align="stretch" gap={4}>
                    {error && (
                      <Text color="red.500" fontSize="sm">
                        {error}
                      </Text>
                    )}

                    <Box>
                      <Text mb={1} fontWeight="medium" color={textColor}>
                        Habit Name
                      </Text>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Exercise"
                        borderColor={borderColor}
                      />
                    </Box>

                    <HStack>
                      <Box flex={1}>
                        <Text mb={1} fontWeight="medium" color={textColor}>
                          Times per
                        </Text>
                        <Input
                          type="number"
                          min="1"
                          value={editTimesPerPeriod}
                          onChange={(e) => setEditTimesPerPeriod(e.target.value)}
                          placeholder="3"
                          borderColor={borderColor}
                        />
                      </Box>
                      <Box flex={1}>
                        <Text mb={1} fontWeight="medium" color={textColor}>
                          Period
                        </Text>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={editPeriod}
                            onChange={(e) => setEditPeriod(e.target.value)}
                            borderColor={borderColor}
                          >
                            {periodOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Box>
                    </HStack>

                    <Box>
                      <Text mb={1} fontWeight="medium" color={textColor}>
                        Description
                      </Text>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Optional description..."
                        borderColor={borderColor}
                        rows={3}
                      />
                    </Box>

                    <HStack justify="space-between" pt={4}>
                      <Button
                        colorPalette="red"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <FaTrash />
                        Delete
                      </Button>
                      <Button
                        colorPalette="green"
                        onClick={handleSave}
                        loading={saving}
                        loadingText="Saving..."
                      >
                        Save Changes
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  // List View
                  <VStack align="stretch" gap={2}>
                    {habits.length === 0 ? (
                      <Text color={textColor} textAlign="center" py={8}>
                        No habits to manage. Create one first!
                      </Text>
                    ) : (
                      habits.map((habit) => (
                        <HStack
                          key={habit._id}
                          p={3}
                          borderWidth={1}
                          borderColor="transparent"
                          borderRadius="md"
                          justify="space-between"
                          cursor="pointer"
                          transition="border-color 0.3s ease"
                          onClick={() => handleSelectHabit(habit)}
                          _hover={{ borderColor: hoverBorderColor }}
                        >
                          <Box>
                            <Text fontWeight="bold" color={textColor}>
                              {habit.title}
                            </Text>
                            <Text fontSize="sm" color={textColor} opacity={0.7}>
                              {habit.frequency?.target || 1} per {habit.frequency?.period || "day"}
                            </Text>
                          </Box>
                          <Box color={textColor} opacity={0.5}>
                            <FaChevronRight />
                          </Box>
                        </HStack>
                      ))
                    )}
                  </VStack>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        habitName={selectedHabit?.title}
        isDeleting={deleting}
      />
    </>
  );
}

export default ManageModal;
