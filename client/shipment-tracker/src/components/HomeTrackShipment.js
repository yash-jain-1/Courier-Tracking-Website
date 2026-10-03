import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, HStack, Input, Button, Text } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { normalizeTrackingNumber } from '../utils/shipment';

// Opens the full tracking page (status, progress and timeline) for the entered number
const HomeTrackShipment = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalized = normalizeTrackingNumber(trackingNumber);
    if (!normalized) {
      setError('Please enter a tracking number');
      return;
    }
    navigate(`/track?id=${encodeURIComponent(normalized)}`);
  };

  return (
    <VStack as="form" spacing={3} align="stretch" onSubmit={handleSubmit}>
      <HStack w="full" spacing={3}>
        <Input
          placeholder="Enter your tracking number..."
          aria-label="Tracking number"
          value={trackingNumber}
          onChange={(e) => {
            setTrackingNumber(e.target.value);
            setError('');
          }}
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
          isInvalid={!!error}
        />
        <Button type="submit" leftIcon={<FaSearch />} size="lg" minW={{ base: 'auto', sm: '120px' }}>
          Track
        </Button>
      </HStack>
      {error && (
        <Text color="red.500" _dark={{ color: 'red.200' }} fontSize="sm" role="alert">
          {error}
        </Text>
      )}
    </VStack>
  );
};

export default HomeTrackShipment;
