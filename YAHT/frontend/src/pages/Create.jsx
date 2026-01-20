import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Box,
  Text,
  Flex,
  Input,
  Combobox,
  useFilter,
  useListCollection,
  Textarea,
  Field,
  Portal,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import HomeCard from "../components/HomeCard.jsx";
import { habitsAPI } from "../services/api.js";
import { useNotification } from "../contexts/NotificationContext.jsx";
import TimeInput from "../components/TimeInput.jsx";

const Create = () => {
  const navigate = useNavigate();
  const { contains } = useFilter({ sensitivity: "base" });
  const { canShowNotifications } = useNotification();

  const [title, setTitle] = useState("");
  const [timesPerPeriod, setTimesPerPeriod] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { collection, filter } = useListCollection({
    initialItems: periodOptions,
    filter: contains,
  });

  const textColor = useColorModeValue("#333333ff", "#cececeff");
  const borderColor = useColorModeValue("#a1a1aa", "#27272a");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a habit name");
      return;
    }

    if (!timesPerPeriod || !period) {
      setError("Please specify frequency (times per period)");
      return;
    }

    setIsLoading(true);

    try {
      const frequency = {
        target: parseInt(timesPerPeriod, 10),
        period: period,
      };

      const habitData = {
        title: title.trim(),
        frequency,
        active: true,
        description: description.trim() || undefined,
      };

      // Add reminder settings if user has notifications enabled
      if (canShowNotifications() && reminderEnabled) {
        habitData.reminderSettings = {
          enabled: reminderEnabled,
          time: reminderTime,
          days: [0, 1, 2, 3, 4, 5, 6], // All days by default
        };
      }

      await habitsAPI.create(habitData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create habit");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodSelect = (details) => {
    if (details.value && details.value.length > 0) {
      setPeriod(details.value[0]);
    }
  };

  return (
    <Container>
      <Text
        fontSize={{
          base: "3xl",
          xl: "4xl",
        }}
        fontWeight="bold"
        color={textColor}
        textAlign="center"
      >
        Create
      </Text>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          sm: "row",
        }}
      >
        <HomeCard
          color="#222222ff"
          gradientFrom="#007241"
          gradientTo="#A65F00"
          gradientVia="#94002D"
        >
          <Box p={10} borderRadius="md">
            <form onSubmit={handleSubmit}>
              <Flex flexDir="column">
                {error && (
                  <Text color="red.500" mb={3} textAlign="center">
                    {error}
                  </Text>
                )}

                <Field.Root required pb={2}>
                  <Field.Label color={textColor}>Habit Name</Field.Label>
                  <Input
                    placeholder="Exercise"
                    variant="flushed"
                    borderColor={borderColor}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field.Root>

                <Flex
                  flexDirection={{
                    base: "column",
                    sm: "row",
                  }}
                >
                  <Field.Root
                    required
                    mr={{
                      base: 0,
                      md: 1,
                    }}
                  >
                    <Field.Label
                      alignSelf={{
                        base: "center",
                        md: "end",
                      }}
                      color={textColor}
                    >
                      Times per
                    </Field.Label>
                    <Input
                      variant="flushed"
                      placeholder="3"
                      type="number"
                      min="1"
                      textAlign={{
                        base: "center",
                        md: "end",
                      }}
                      color={textColor}
                      borderColor={borderColor}
                      value={timesPerPeriod}
                      onChange={(e) => setTimesPerPeriod(e.target.value)}
                    />
                  </Field.Root>

                  <Combobox.Root
                    variant="flushed"
                    ml={{
                      base: 0,
                      md: 1,
                    }}
                    collection={collection}
                    onInputValueChange={(e) => filter(e.inputValue)}
                    onValueChange={handlePeriodSelect}
                  >
                    <Combobox.Label color={textColor}>Period</Combobox.Label>
                    <Combobox.Control>
                      <Combobox.Input
                        placeholder="Day"
                        borderColor={borderColor}
                      />
                      <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                      </Combobox.IndicatorGroup>
                    </Combobox.Control>
                    <Portal>
                      <Combobox.Positioner>
                        <Combobox.Content>
                          {collection.items.map((item) => (
                            <Combobox.Item key={item.value} item={item}>
                              {item.label}
                            </Combobox.Item>
                          ))}
                        </Combobox.Content>
                      </Combobox.Positioner>
                    </Portal>
                  </Combobox.Root>
                </Flex>

                <Field.Root pt={3}>
                  <Field.Label color={textColor}>Habit Description</Field.Label>
                  <Textarea
                    placeholder="Exercise for 30 minutes..."
                    variant="flushed"
                    color={textColor}
                    borderColor={borderColor}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field.Root>

                {canShowNotifications() && (
                  <Box pt={4} pb={2}>
                    <Field.Label color={textColor} mb={3}>
                      Reminder Settings
                    </Field.Label>
                    <VStack align="stretch" gap={3}>
                      <HStack justify="space-between">
                        <Text color={textColor} fontSize="sm">
                          Send me reminders
                        </Text>
                        <Button
                          size="xs"
                          colorPalette={reminderEnabled ? "green" : "gray"}
                          variant={reminderEnabled ? "solid" : "outline"}
                          onClick={() => setReminderEnabled(!reminderEnabled)}
                        >
                          {reminderEnabled ? "Yes" : "No"}
                        </Button>
                      </HStack>
                      {reminderEnabled && (
                        <Field.Root>
                          <Field.Label color={textColor} fontSize="sm">
                            Reminder Time (24h)
                          </Field.Label>
                          <TimeInput
                            value={reminderTime}
                            onChange={setReminderTime}
                            size="sm"
                          />
                        </Field.Root>
                      )}
                    </VStack>
                  </Box>
                )}

                <Button
                  mt={5}
                  borderWidth={1}
                  variant="outline"
                  color={textColor}
                  borderColor={borderColor}
                  _hover={{
                    bg: borderColor,
                  }}
                  type="submit"
                  loading={isLoading}
                  loadingText="Creating..."
                >
                  Create
                </Button>
              </Flex>
            </form>
          </Box>
        </HomeCard>
      </Flex>
    </Container>
  );
};

const periodOptions = [
  {
    label: "Day",
    value: "day",
  },
  {
    label: "Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
];

export default Create;
