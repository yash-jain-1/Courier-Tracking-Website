import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  Progress,
  Card,
  CardBody,
  Heading,
  Divider,
  Badge,
  useToast,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { fetchShipment, getErrorMessage } from '../services/api';
import TrackingTimeline from '../components/TrackingTimeline';
import {
  PROGRESS_STEPS,
  formatStatus,
  formatDateTime,
  getCurrentLocation,
  getProgress,
  getStatusColor,
  getStatusIcon,
  normalizeTrackingNumber,
} from '../utils/shipment';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const DeliveryProgress = ({ shipment }) => {
  const { stepIndex, value, isDelayed } = getProgress(shipment);
  const lastIndex = PROGRESS_STEPS.length - 1;

  return (
    <VStack align="stretch" spacing={2}>
      <Text fontSize="sm" color="fg.muted" fontWeight="500">
        DELIVERY PROGRESS
      </Text>
      <Progress
        value={value}
        colorScheme={isDelayed ? 'red' : 'brand'}
        size="lg"
        rounded="full"
        bg="bg.track"
        aria-label={`Delivery progress: ${PROGRESS_STEPS[stepIndex].label}`}
      />
      {/* Narrow screens: only the current step, since five labels don't fit */}
      <Text display={{ base: 'block', sm: 'none' }} fontSize="xs" color="fg.muted" aria-hidden="true">
        Step {stepIndex + 1} of {PROGRESS_STEPS.length}:{' '}
        <Text as="span" fontWeight="700" color="fg.heading">{PROGRESS_STEPS[stepIndex].label}</Text>
      </Text>
      {/* Labels are positioned at the same percentages as the progress value */}
      <Box display={{ base: 'none', sm: 'block' }} position="relative" h="2.5em" fontSize="xs" aria-hidden="true">
        {PROGRESS_STEPS.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === lastIndex;
          return (
            <Text
              key={step.value}
              position="absolute"
              w="20%"
              lineHeight="short"
              left={isLast ? undefined : `${(index / lastIndex) * 100}%`}
              right={isLast ? 0 : undefined}
              transform={isFirst || isLast ? undefined : 'translateX(-50%)'}
              textAlign={isFirst ? 'left' : isLast ? 'right' : 'center'}
              color={index <= stepIndex ? 'fg.heading' : 'fg.subtle'}
              fontWeight={index === stepIndex ? '700' : '400'}
            >
              {step.label}
            </Text>
          );
        })}
      </Box>
    </VStack>
  );
};

const TrackShipment = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTrackingNumber = normalizeTrackingNumber(searchParams.get('id'));
  const [trackingNumber, setTrackingNumber] = useState(queryTrackingNumber);
  const [shipmentData, setShipmentData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const latestRequest = useRef(0);
  const toast = useToast();

  // The URL (?id=) is the source of truth, so results are shareable and back/forward work
  useEffect(() => {
    setTrackingNumber(queryTrackingNumber);
    if (!queryTrackingNumber) {
      setShipmentData(null);
      setError(null);
      return;
    }

    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);
    setShipmentData(null);

    fetchShipment(queryTrackingNumber)
      .then((response) => {
        if (requestId !== latestRequest.current) return;
        setShipmentData(response.data);
      })
      .catch((err) => {
        if (requestId !== latestRequest.current) return;
        console.error('Error fetching shipment:', err);
        setError(
          err.response?.status === 404
            ? `No shipment found for "${queryTrackingNumber}". Please check the tracking number and try again.`
            : getErrorMessage(err, 'Something went wrong while fetching your shipment. Please try again.')
        );
      })
      .finally(() => {
        if (requestId === latestRequest.current) setLoading(false);
      });
  }, [queryTrackingNumber, refreshKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    const normalized = normalizeTrackingNumber(trackingNumber);
    if (!normalized) {
      toast({
        title: 'Tracking number required',
        description: 'Please enter a tracking number',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (normalized === queryTrackingNumber) {
      // Same number: refetch without adding a history entry
      setRefreshKey((key) => key + 1);
      return;
    }
    setSearchParams({ id: normalized });
  };

  return (
    <Flex w="full" mt={7} mb={12} px={4} justify="center">
      <Box w="full" maxW="2xl">
        <VStack spacing={6} align="stretch">
          {/* Search Section */}
          <VStack as="form" spacing={4} onSubmit={handleSearch}>
            <HStack w="full" spacing={3}>
              <Input
                placeholder="Enter your tracking number..."
                aria-label="Tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                size="lg"
                bg="bg.input"
                border="2px solid"
                borderColor="border.subtle"
                _hover={{ borderColor: 'brand.300' }}
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                }}
                autoCapitalize="characters"
                autoComplete="off"
                isDisabled={loading}
              />
              <Button
                type="submit"
                leftIcon={<FaSearch />}
                size="lg"
                minW={{ base: 'auto', sm: '120px' }}
                isLoading={loading}
                loadingText="Searching"
              >
                Track
              </Button>
            </HStack>

            <Text fontSize="sm" color="fg.subtle" textAlign="center">
              Enter the tracking number from your booking receipt to see real-time updates
            </Text>
          </VStack>

          {loading && (
            <Text fontSize="sm" color="fg.muted" textAlign="center">
              Looking up your shipment… this can take a few seconds if the server is waking up.
            </Text>
          )}

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {error && (
              <MotionBox
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert status="error" rounded="lg">
                  <AlertIcon />
                  {error}
                </Alert>
              </MotionBox>
            )}

            {shipmentData && (
              <MotionBox
                key={shipmentData.trackingNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <VStack spacing={6} align="stretch">
                  {/* Status Overview */}
                  <MotionCard
                    variant="elevated"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="start" gap={3} wrap="wrap">
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="fg.muted" fontWeight="500">
                              TRACKING NUMBER
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="fg.heading" wordBreak="break-all">
                              {shipmentData.trackingNumber}
                            </Text>
                          </VStack>

                          <Badge
                            colorScheme={getStatusColor(shipmentData.status)}
                            variant="solid"
                            px={3}
                            py={1}
                            rounded="full"
                            fontSize="sm"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            textTransform="none"
                          >
                            <Icon as={getStatusIcon(shipmentData.status)} />
                            {formatStatus(shipmentData.status)}
                          </Badge>
                        </Flex>

                        {shipmentData.status?.toLowerCase() === 'delayed' && (
                          <Alert status="warning" rounded="md" fontSize="sm">
                            <AlertIcon />
                            This shipment is delayed. We'll update the timeline as soon as it moves.
                          </Alert>
                        )}

                        <Divider />

                        <Flex gap={6} wrap="wrap">
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="fg.muted" fontWeight="500">
                              CURRENT LOCATION
                            </Text>
                            <HStack>
                              <Icon as={FaMapMarkerAlt} color="brand.500" />
                              <Text fontWeight="600" color="fg.heading">
                                {getCurrentLocation(shipmentData)}
                              </Text>
                            </HStack>
                          </VStack>
                          {shipmentData.updatedAt && (
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="fg.muted" fontWeight="500">
                                LAST UPDATED
                              </Text>
                              <Text fontWeight="600" color="fg.heading">
                                {formatDateTime(shipmentData.updatedAt)}
                              </Text>
                            </VStack>
                          )}
                        </Flex>

                        <DeliveryProgress shipment={shipmentData} />
                      </VStack>
                    </CardBody>
                  </MotionCard>

                  {/* Timeline */}
                  <MotionCard
                    variant="outline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md" color="fg.heading">
                          Shipment Timeline
                        </Heading>
                        <Divider />
                        {shipmentData.updates?.length > 0 ? (
                          <TrackingTimeline updates={shipmentData.updates} />
                        ) : (
                          <Text fontSize="sm" color="fg.muted">
                            No tracking events yet. Check back soon.
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </VStack>
      </Box>
    </Flex>
  );
};

export default TrackShipment;
