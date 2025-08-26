import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  SimpleGrid,
  Heading,
  Text,
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTruck,
  FaBoxOpen,
  FaUsers,
  FaChartLine,
  FaEllipsisV,
  FaDownload,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const StatCard = ({ icon, label, number, percentage, isPositive = true }) => (
  <MotionCard
    variant="elevated"
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <CardBody>
      <Stat>
        <Flex justify="space-between" align="start">
          <Box>
            <StatLabel color="gray.600" fontSize="sm" fontWeight="600">
              {label}
            </StatLabel>
            <StatNumber fontSize="2xl" color="navy.800" fontWeight="bold">
              {number}
            </StatNumber>
            {percentage && (
              <StatHelpText>
                <StatArrow type={isPositive ? 'increase' : 'decrease'} />
                {percentage}%
              </StatHelpText>
            )}
          </Box>
          <Box p={3} bg="brand.100" rounded="lg">
            <Box as={icon} w={6} h={6} color="brand.500" />
          </Box>
        </Flex>
      </Stat>
    </CardBody>
  </MotionCard>
);

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

const AdminDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    status: 'processing',
    location: '',
    updateData: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      location: '',
      activity: '',
      remarks: ''
    }
  });

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  
  const toast = useToast();
  const navigate = useNavigate();

  const stats = [
    { icon: FaBoxOpen, label: 'Total Shipments', number: '1,234', percentage: 12, isPositive: true },
    { icon: FaTruck, label: 'In Transit', number: '456', percentage: 8, isPositive: true },
    { icon: FaUsers, label: 'Active Customers', number: '890', percentage: 15, isPositive: true },
    { icon: FaChartLine, label: 'Delivery Rate', number: '99.2%', percentage: 2, isPositive: true },
  ];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchShipments();
  }, [navigate]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      // This endpoint would need to be implemented in the backend
      const response = await axios.get('/api/admin/shipments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShipments(response.data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      // For demo purposes, using mock data
      setShipments([
        {
          _id: '1',
          trackingNumber: 'SH2025001',
          status: 'delivered',
          location: 'Mumbai',
          createdAt: new Date().toISOString(),
          updates: [
            { date: '2025-01-20', time: '10:30 AM', location: 'Mumbai', activity: 'Package Delivered', remarks: 'Delivered to recipient' }
          ]
        },
        {
          _id: '2',
          trackingNumber: 'SH2025002',
          status: 'in transit',
          location: 'Delhi',
          createdAt: new Date().toISOString(),
          updates: [
            { date: '2025-01-20', time: '08:45 AM', location: 'Delhi', activity: 'In Transit', remarks: 'Package on the way' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/shipments', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast({
        title: 'Shipment Created',
        description: 'New shipment has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onCreateClose();
      fetchShipments();
      resetForm();
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shipment. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/shipments/${selectedShipment.trackingNumber}/updates`, {
        status: formData.status,
        updateData: formData.updateData
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast({
        title: 'Shipment Updated',
        description: 'Shipment status has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onUpdateClose();
      fetchShipments();
      resetForm();
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shipment. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      trackingNumber: '',
      status: 'processing',
      location: '',
      updateData: {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        location: '',
        activity: '',
        remarks: ''
      }
    });
  };

  const handleViewShipment = (shipment) => {
    setSelectedShipment(shipment);
    onViewOpen();
  };

  const handleEditShipment = (shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      ...formData,
      status: shipment.status,
      updateData: {
        ...formData.updateData,
        location: shipment.location
      }
    });
    onUpdateOpen();
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box bg="gray.50" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color="gray.600">Loading dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" py={8}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading fontSize="2xl" color="navy.800">
                  Admin Dashboard
                </Heading>
                <Text color="gray.600">
                  Manage shipments and track deliveries
                </Text>
              </VStack>
              <HStack spacing={3}>
                <Button
                  leftIcon={<FaPlus />}
                  onClick={onCreateOpen}
                  size="sm"
                >
                  Add Shipment
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  size="sm"
                >
                  Logout
                </Button>
              </HStack>
            </Flex>

            {/* Stats */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {stats.map((stat, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StatCard {...stat} />
                </MotionBox>
              ))}
            </SimpleGrid>

            {/* Filters and Actions */}
            <Card variant="elevated">
              <CardBody>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <HStack spacing={4} flex={1}>
                    <Input
                      placeholder="Search by tracking number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      maxW="300px"
                      leftElement={<FaSearch />}
                    />
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      maxW="200px"
                    >
                      <option value="all">All Status</option>
                      <option value="processing">Processing</option>
                      <option value="picked up">Picked Up</option>
                      <option value="in transit">In Transit</option>
                      <option value="out for delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </Select>
                  </HStack>
                  <Button leftIcon={<FaDownload />} variant="outline" size="sm">
                    Export
                  </Button>
                </Flex>
              </CardBody>
            </Card>

            {/* Shipments Table */}
            <Card variant="elevated">
              <CardHeader>
                <Heading size="md" color="navy.800">
                  Recent Shipments
                </Heading>
              </CardHeader>
              <CardBody p={0}>
                {filteredShipments.length === 0 ? (
                  <Box p={8} textAlign="center">
                    <Text color="gray.500">No shipments found</Text>
                  </Box>
                ) : (
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Tracking Number</Th>
                        <Th>Status</Th>
                        <Th>Location</Th>
                        <Th>Last Updated at</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredShipments.map((shipment) => (
                        <Tr key={shipment._id} _hover={{ bg: 'gray.50' }}>
                          <Td fontWeight="600" color="navy.800">
                            {shipment.trackingNumber}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(shipment.status)}
                              variant="subtle"
                              px={2}
                              py={1}
                              rounded="full"
                              fontSize="xs"
                            >
                              {shipment.status?.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td color="gray.600">{shipment.location}</Td>
                          <Td color="gray.600">
                            {(() => {
                              const dateStr = shipment.updatedAt || shipment.createdAt;
                              const d = new Date(dateStr);
                              return isNaN(d.getTime())
                                ? 'N/A'
                                : d.toLocaleString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  });
                            })()}
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FaEllipsisV />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<FaEye />}
                                  onClick={() => handleViewShipment(shipment)}
                                >
                                  View Details
                                </MenuItem>
                                <MenuItem
                                  icon={<FaEdit />}
                                  onClick={() => handleEditShipment(shipment)}
                                >
                                  Update Status
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </VStack>
        </MotionBox>

        {/* Modals */}
        {/* Create Shipment Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Shipment</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleCreateShipment}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Tracking Number</FormLabel>
                    <Input
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                      placeholder="Enter tracking number"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="processing">Processing</option>
                      <option value="picked up">Picked Up</option>
                      <option value="in transit">In Transit</option>
                      <option value="out for delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Enter current location"
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onCreateClose}>
                  Cancel
                </Button>
                <Button type="submit">Create Shipment</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Update Shipment Modal */}
        <Modal isOpen={isUpdateOpen} onClose={onUpdateClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Shipment Status</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleUpdateShipment}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="processing">Processing</option>
                      <option value="picked up">Picked Up</option>
                      <option value="in transit">In Transit</option>
                      <option value="out for delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={formData.updateData.location}
                      onChange={(e) => setFormData({
                        ...formData,
                        updateData: {...formData.updateData, location: e.target.value}
                      })}
                      placeholder="Enter location"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Activity</FormLabel>
                    <Input
                      value={formData.updateData.activity}
                      onChange={(e) => setFormData({
                        ...formData,
                        updateData: {...formData.updateData, activity: e.target.value}
                      })}
                      placeholder="Enter activity description"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Remarks</FormLabel>
                    <Textarea
                      value={formData.updateData.remarks}
                      onChange={(e) => setFormData({
                        ...formData,
                        updateData: {...formData.updateData, remarks: e.target.value}
                      })}
                      placeholder="Enter additional remarks"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onUpdateClose}>
                  Cancel
                </Button>
                <Button type="submit">Update Shipment</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* View Shipment Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Shipment Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedShipment && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="600">TRACKING NUMBER</Text>
                    <Text fontSize="lg" fontWeight="bold">{selectedShipment.trackingNumber}</Text>
                  </Box>
                  <Divider />
                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="600">STATUS</Text>
                      <Badge colorScheme={getStatusColor(selectedShipment.status)} variant="solid">
                        {selectedShipment.status?.toUpperCase()}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="600">LOCATION</Text>
                      <Text fontWeight="600">{selectedShipment.location}</Text>
                    </Box>
                  </HStack>
                  {selectedShipment.updates && selectedShipment.updates.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" color="gray.600" fontWeight="600" mb={2}>UPDATES</Text>
                        <VStack spacing={2} align="stretch">
                          {selectedShipment.updates.map((update, index) => (
                            <Box key={index} p={3} bg="gray.50" rounded="lg">
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="sm" fontWeight="600">{update.activity}</Text>
                                <Text fontSize="xs" color="gray.500">{update.date}</Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.600">
                                {update.location} • {update.time}
                              </Text>
                              {update.remarks && (
                                <Text fontSize="xs" color="gray.500" mt={1}>{update.remarks}</Text>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    </>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onViewClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default AdminDashboard;