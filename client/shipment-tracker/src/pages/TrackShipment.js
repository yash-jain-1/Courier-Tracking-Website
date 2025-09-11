import React, { useState } from 'react';
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
  Spinner,
  Icon,
  Flex,
} from '@chakra-ui/react';
// Removed unused import Container
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaTruck,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaClock,
} from 'react-icons/fa';
import { fetchShipment } from '../services/api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return FaCheckCircle;
    case 'in transit':
    case 'out for delivery':
      return FaShippingFast;
    case 'picked up':
    case 'processing':
      return FaBoxOpen;
    default:
      return FaTruck;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'green';
    case 'in transit':
    case 'out for delivery':
      return 'blue';
    case 'picked up':
    case 'processing':
      return 'orange';
    case 'delayed':
      return 'red';
    default:
      return 'gray';
  }
};

const getProgressValue = (status) => {
  switch (status?.toLowerCase()) {
    case 'picked up':
    case 'processing':
      return 25;
    case 'in transit':
      return 50;
    case 'out for delivery':
      return 75;
    case 'delivered':
      return 100;
    default:
      return 0;
  }
};

const TrackingTimeline = ({ updates }) => {
  if (!updates || updates.length === 0) return null;

  return (
    <VStack align="stretch" spacing={4} w="full">
      {updates.map((update, index) => (
        <MotionBox
          key={update._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Flex align="start" gap={4}>
            {/* Timeline Connector */}
            <VStack spacing={0}>
              <Box
                w={4}
                h={4}
                rounded="full"
                bg={index === 0 ? 'brand.500' : 'gray.300'}
                border="2px solid white"
                shadow="sm"
              />
              {index < updates.length - 1 && (
                <Box w="2px" h={8} bg="gray.200" />
              )}
            </VStack>

            {/* Timeline Content */}
            <Box flex={1}>
              <Card size="sm" variant="outline">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="600" color="navy.800" fontSize="sm">
                        {update.activity}
                      </Text>
                      <Badge
                        colorScheme={index === 0 ? 'blue' : 'gray'}
                        variant="subtle"
                        fontSize="xs"
                      >
                        {new Date(update.date).toLocaleDateString()}
                      </Badge>
                    </HStack>
                    
                    <HStack spacing={4} fontSize="xs" color="gray.600">
                      <HStack>
                        <Icon as={FaMapMarkerAlt} />
                        <Text>{update.location}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaClock} />
                        <Text>{update.time}</Text>
                      </HStack>
                    </HStack>
                    
                    {update.remarks && (
                      <Text fontSize="sm" color="gray.600">
                        {update.remarks}
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          </Flex>
        </MotionBox>
      ))}
    </VStack>
  );
};

const TrackShipment = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentData, setShipmentData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
    if (error) setError(null);
  };

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: 'Invalid Tracking Number',
        description: 'Please enter a valid tracking number',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setError(null);
    setShipmentData(null);

    try {
      // For local development, the "proxy" field in package.json should point to your backend server (e.g., "http://localhost:5000").
      // In production, set REACT_APP_API_BASE_URL in your environment to your backend API base URL.
      // This ensures axios uses the correct base URL in both environments.
      
  const response = await fetchShipment(trackingNumber);

      setShipmentData(response.data);
      
      toast({
        title: 'Shipment Found',
        description: 'Your shipment details have been loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error fetching shipment:', err);
      setError('Shipment not found. Please check your tracking number and try again.');
      
      toast({
        title: 'Shipment Not Found',
        description: 'Please check your tracking number and try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Flex w="full" mt={7} px={{ base: 4, md: 16, lg: 32 }} justify="center">
      <Box w="full" maxW="400px">
        <VStack spacing={6} align="stretch">
        {/* Search Section */}
        <VStack spacing={4}>
          <HStack w="full" spacing={3}>
            <Input
              placeholder="Enter your tracking number..."
              value={trackingNumber}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              size="lg"
              bg="white"
              border="2px solid"
              borderColor="gray.200"
              _hover={{ borderColor: 'brand.300' }}
              _focus={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              }}
              disabled={loading}
            />
            <Button
              leftIcon={loading ? <Spinner size="sm" /> : <FaSearch />}
              onClick={handleSearch}
              size="lg"
              minW="120px"
              isLoading={loading}
              loadingText="Searching"
            >
              Track
            </Button>
          </HStack>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Enter your 10-12 digit tracking number to get real-time updates
          </Text>
        </VStack>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {error && (
            <MotionBox
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
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">
                            TRACKING NUMBER
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="navy.800">
                            {trackingNumber.toUpperCase()}
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
                        >
                          <Icon as={getStatusIcon(shipmentData.status)} />
                          {shipmentData.status?.toUpperCase()}
                        </Badge>
                      </HStack>

                      <Divider />

                      <HStack spacing={6}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">
                            CURRENT LOCATION
                          </Text>
                          <HStack>
                            <Icon as={FaMapMarkerAlt} color="brand.500" />
                            <Text fontWeight="600" color="navy.800">
                              {shipmentData.location}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Progress Bar */}
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm" color="gray.600" fontWeight="500">
                          DELIVERY PROGRESS
                        </Text>
                        <Progress
                          value={getProgressValue(shipmentData.status)}
                          colorScheme="brand"
                          size="lg"
                          rounded="full"
                          bg="gray.200"
                        />
                        <HStack justify="space-between" fontSize="xs" color="gray.500">
                          <Text>Picked Up</Text>
                          <Text>In Transit</Text>
                          <Text>Out for Delivery</Text>
                          <Text>Delivered</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </MotionCard>

                {/* Timeline */}
                {shipmentData.updates && shipmentData.updates.length > 0 && (
                  <MotionCard
                    variant="outline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md" color="navy.800">
                          Shipment Timeline
                        </Heading>
                        <Divider />
                        <TrackingTimeline updates={shipmentData.updates} />
                      </VStack>
                    </CardBody>
                  </MotionCard>
                )}
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