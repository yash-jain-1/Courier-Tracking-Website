
import React, { useState } from 'react';
import { fetchShipment } from '../services/api';
import {
  Flex,
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Card,
  CardBody,
  Divider,
  Spinner,
  Badge,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const HomeTrackShipment = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shipmentData, setShipmentData] = useState(null);

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
    setError('');
  };

  const handleSearch = async () => {
    if (!trackingNumber) {
      setError('Please enter a tracking number');
      return;
    }
    setLoading(true);
    setError('');
    setShipmentData(null);
    try {
      // Use the proxy for local dev, just like TrackShipment
  const response = await fetchShipment(trackingNumber);
      setShipmentData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Shipment not found. Please check the tracking number.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex w="full" mt={7} px={{ base: 2, md: 8 }} justify="center">
      <Box w="full" maxW="400px">
        <VStack spacing={6} align="stretch">
          {/* Search Section */}
          <VStack spacing={4}>
            <HStack w="full" spacing={3}>
              <Input
                placeholder="Enter your tracking number..."
                value={trackingNumber}
                onChange={handleInputChange}
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
          {error && (
            <Box bg="red.50" p={2} rounded="md">
              <Text color="red.500" fontSize="sm">{error}</Text>
            </Box>
          )}
          {shipmentData && (
            <Card variant="elevated">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600" fontWeight="500">
                        TRACKING NUMBER
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="navy.800">
                        {shipmentData.trackingNumber?.toUpperCase()}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
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
                      value={50}
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
            </Card>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default HomeTrackShipment;
