import React from 'react';
import { Box, VStack, HStack, Text, Card, CardBody, Badge, Icon, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { formatStatus, formatUpdateDateTime, sortUpdatesNewestFirst } from '../utils/shipment';

const MotionBox = motion(Box);

const TrackingTimeline = ({ updates, animate = true }) => {
  if (!updates || updates.length === 0) return null;

  const sortedUpdates = sortUpdatesNewestFirst(updates);

  return (
    <VStack as="ol" listStyleType="none" align="stretch" spacing={4} w="full">
      {sortedUpdates.map((update, index) => {
        const { date, time } = formatUpdateDateTime(update);
        const isLatest = index === 0;
        return (
          <MotionBox
            as="li"
            key={update._id || index}
            initial={animate ? { opacity: 0, x: -20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index, 10) * 0.08 }}
          >
            <Flex align="start" gap={4}>
              {/* Timeline Connector */}
              <VStack spacing={0} pt={4}>
                <Box
                  w={4}
                  h={4}
                  rounded="full"
                  bg={isLatest ? 'brand.500' : 'bg.track'}
                  border="2px solid"
                  borderColor="bg.surface"
                  shadow="sm"
                />
                {index < sortedUpdates.length - 1 && (
                  <Box w="2px" h={10} bg="bg.track" />
                )}
              </VStack>

              {/* Timeline Content */}
              <Box flex={1} minW={0}>
                <Card size="sm" variant="outline">
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="full" align="start">
                        <Text fontWeight="600" color="fg.heading" fontSize="sm">
                          {formatStatus(update.status)}
                        </Text>
                        <Badge
                          colorScheme={isLatest ? 'blue' : 'gray'}
                          variant="subtle"
                          fontSize="xs"
                          flexShrink={0}
                        >
                          {date}
                        </Badge>
                      </HStack>

                      <Flex wrap="wrap" columnGap={4} rowGap={1} fontSize="xs" color="fg.muted">
                        <HStack>
                          <Icon as={FaMapMarkerAlt} />
                          <Text>{update.location}</Text>
                        </HStack>
                        {time && (
                          <HStack>
                            <Icon as={FaClock} />
                            <Text>{time}</Text>
                          </HStack>
                        )}
                      </Flex>

                      {update.remarks && (
                        <Text fontSize="sm" color="fg.muted" whiteSpace="pre-wrap">
                          {update.remarks}
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
            </Flex>
          </MotionBox>
        );
      })}
    </VStack>
  );
};

export default TrackingTimeline;
