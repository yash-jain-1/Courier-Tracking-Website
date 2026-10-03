import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  Button,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Badge,
  Flex,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Textarea,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';

import { motion } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTruck,
  FaBoxOpen,
  FaChartLine,
  FaEllipsisV,
  FaDownload,
  FaSearch,
  FaTrash,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllShipments,
  fetchShipmentStats,
  addShipment,
  updateShipment,
  deleteShipment,
  getErrorMessage,
} from '../services/api';
import { clearToken } from '../utils/auth';
import TrackingTimeline from '../components/TrackingTimeline';
import {
  STATUS_OPTIONS,
  formatStatus,
  formatDateTime,
  getCurrentLocation,
  getStatusColor,
  toDateTimeLocalValue,
} from '../utils/shipment';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];
const SEARCH_DEBOUNCE_MS = 300;

const StatCard = ({ icon, label, number, helpText }) => (
  <MotionCard
    variant="elevated"
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <CardBody>
      <Stat>
        <Flex justify="space-between" align="start">
          <Box>
            <StatLabel color="fg.muted" fontSize="sm" fontWeight="600">
              {label}
            </StatLabel>
            <StatNumber fontSize="2xl" color="fg.heading" fontWeight="bold">
              {number}
            </StatNumber>
            {helpText && (
              <StatHelpText color="fg.subtle" mb={0}>
                {helpText}
              </StatHelpText>
            )}
          </Box>
          <Box p={3} bg="bg.accent" rounded="lg">
            <Box as={icon} w={6} h={6} color="brand.500" />
          </Box>
        </Flex>
      </Stat>
    </CardBody>
  </MotionCard>
);

const buildStats = (stats) => {
  if (!stats) return [];
  const { total, byStatus } = stats;
  const inTransit = (byStatus['in transit'] || 0) + (byStatus['out for delivery'] || 0);
  const delivered = byStatus.delivered || 0;
  const delayed = byStatus.delayed || 0;
  const format = (n) => n.toLocaleString('en-IN');
  return [
    { icon: FaBoxOpen, label: 'Total Shipments', number: format(total) },
    { icon: FaTruck, label: 'In Transit', number: format(inTransit), helpText: 'Including out for delivery' },
    { icon: FaExclamationTriangle, label: 'Delayed', number: format(delayed) },
    {
      icon: FaChartLine,
      label: 'Delivered',
      number: format(delivered),
      helpText: total ? `${((delivered / total) * 100).toFixed(1)}% of all shipments` : undefined,
    },
  ];
};

const StatusOptions = () =>
  STATUS_OPTIONS.map(({ value, label }) => (
    <option key={value} value={value}>{label}</option>
  ));

const emptyCreateForm = () => ({ trackingNumber: '', status: 'processing', location: '', remarks: '' });

const emptyUpdateForm = (shipment) => ({
  status: shipment?.status?.toLowerCase() || 'processing',
  location: getCurrentLocation(shipment) || '',
  date: toDateTimeLocalValue(),
  remarks: '',
});

const escapeCsvValue = (value) => {
  let text = String(value ?? '');
  // Prevent spreadsheet formula injection
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (shipments) => {
  const header = ['Tracking Number', 'Status', 'Location', 'Last Updated', 'Created'];
  const rows = shipments.map((s) => [
    s.trackingNumber,
    formatStatus(s.status),
    s.location,
    formatDateTime(s.updatedAt),
    formatDateTime(s.createdAt),
  ]);
  const csv = [header, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `shipments-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const AdminDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [updateForm, setUpdateForm] = useState(emptyUpdateForm);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const latestRequest = useRef(0);
  const cancelDeleteRef = useRef();

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const toast = useToast();
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const queryParams = {
    q: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  };

  // Debounce search so we don't query on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchShipments = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const response = await fetchAllShipments({
        page,
        limit,
        q: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      if (requestId !== latestRequest.current) return;
      setShipments(response.data.shipments);
      setTotal(response.data.total);
      setLoadError('');
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      console.error('Error fetching shipments:', error);
      setLoadError(getErrorMessage(error, 'Failed to load shipments.'));
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  }, [page, limit, searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetchShipmentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const refresh = () => {
    fetchShipments();
    fetchStats();
  };

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // If the current page no longer exists (e.g. after deleting its last row), step back
  useEffect(() => {
    if (hasLoaded && page > totalPages) setPage(totalPages);
  }, [hasLoaded, page, totalPages]);

  const showError = (title, error, fallback) => {
    toast({
      title,
      description: getErrorMessage(error, fallback),
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const openCreateModal = () => {
    setCreateForm(emptyCreateForm());
    onCreateOpen();
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await addShipment(createForm);
      toast({
        title: 'Shipment Created',
        description: `Shipment ${response.data.trackingNumber} has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCreateClose();
      refresh();
    } catch (error) {
      console.error('Error creating shipment:', error);
      showError('Could not create shipment', error, 'Failed to create shipment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    const eventDate = new Date(updateForm.date);
    if (Number.isNaN(eventDate.getTime())) {
      toast({ title: 'Please enter a valid date and time', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      await updateShipment(selectedShipment.trackingNumber, {
        status: updateForm.status,
        updateData: {
          date: eventDate.toISOString(),
          location: updateForm.location,
          remarks: updateForm.remarks,
        },
      });
      toast({
        title: 'Shipment Updated',
        description: `Shipment ${selectedShipment.trackingNumber} has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onUpdateClose();
      refresh();
    } catch (error) {
      console.error('Error updating shipment:', error);
      showError('Could not update shipment', error, 'Failed to update shipment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewShipment = (shipment) => {
    setSelectedShipment(shipment);
    onViewOpen();
  };

  const handleEditShipment = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateForm(emptyUpdateForm(shipment));
    onUpdateOpen();
  };

  const handleDeleteShipment = async () => {
    const shipment = shipmentToDelete;
    setSubmitting(true);
    try {
      await deleteShipment(shipment.trackingNumber);
      toast({
        title: 'Shipment Deleted',
        description: `Shipment ${shipment.trackingNumber} has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setShipmentToDelete(null);
      refresh();
    } catch (error) {
      console.error('Error deleting shipment:', error);
      showError('Could not delete shipment', error, 'Failed to delete shipment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetchAllShipments({ ...queryParams, limit: 'all' });
      downloadCsv(response.data.shipments);
    } catch (error) {
      console.error('Error exporting shipments:', error);
      showError('Export failed', error, 'Failed to export shipments. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  if (!hasLoaded) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color="fg.muted">Loading dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  const firstRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastRow = Math.min(page * limit, total);
  const hasFilters = !!searchTerm || statusFilter !== 'all';

  return (
    <Box minH="100vh">
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
                <Heading fontSize="2xl" color="fg.heading">
                  Admin Dashboard
                </Heading>
                <Text color="fg.muted">
                  Manage shipments and track deliveries
                </Text>
              </VStack>
              <HStack spacing={3}>
                <Button leftIcon={<FaPlus />} onClick={openCreateModal} size="sm">
                  Add Shipment
                </Button>
                <Button variant="outline" onClick={handleLogout} size="sm">
                  Logout
                </Button>
              </HStack>
            </Flex>

            {/* Stats */}
            {stats && (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                {buildStats(stats).map((stat, index) => (
                  <MotionBox
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <StatCard {...stat} />
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}

            {/* Filters and Actions */}
            <Card variant="elevated">
              <CardBody>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <Flex gap={4} flex={1} wrap="wrap">
                    <InputGroup maxW={{ base: 'full', md: '300px' }}>
                      <InputLeftElement pointerEvents="none" color="fg.subtle">
                        <FaSearch />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by tracking number..."
                        aria-label="Search by tracking number"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </InputGroup>
                    <Select
                      aria-label="Filter by status"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      maxW="200px"
                    >
                      <option value="all">All Status</option>
                      <StatusOptions />
                    </Select>
                    <Select
                      aria-label="Shipments per page"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1); // Reset to first page when limit changes
                      }}
                      maxW="120px"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>{size} / page</option>
                      ))}
                    </Select>
                  </Flex>
                  <Button
                    leftIcon={<FaDownload />}
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    isLoading={exporting}
                    loadingText="Exporting"
                    isDisabled={total === 0}
                  >
                    Export CSV
                  </Button>
                </Flex>
              </CardBody>
            </Card>

            {loadError && (
              <Alert status="error" rounded="lg">
                <AlertIcon />
                <AlertDescription flex={1}>{loadError}</AlertDescription>
                <Button size="sm" onClick={refresh} isLoading={loading}>
                  Retry
                </Button>
              </Alert>
            )}

            {/* Shipments Table */}
            <Card variant="elevated">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color="fg.heading">
                    Recent Shipments
                  </Heading>
                  {loading && <Spinner size="sm" color="brand.500" />}
                </HStack>
              </CardHeader>
              <CardBody p={0}>
                {shipments.length === 0 ? (
                  <Box p={8} textAlign="center">
                    <Text color="fg.subtle">
                      {hasFilters ? 'No shipments match your filters' : 'No shipments yet'}
                    </Text>
                  </Box>
                ) : (
                  <TableContainer opacity={loading ? 0.6 : 1} transition="opacity 0.2s">
                    <Table variant="simple">
                      <Thead bg="bg.muted">
                        <Tr>
                          <Th>Tracking Number</Th>
                          <Th>Status</Th>
                          <Th>Location</Th>
                          <Th>Last Updated</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {shipments.map((shipment) => (
                          <Tr key={shipment._id} _hover={{ bg: 'bg.muted' }}>
                            <Td fontWeight="600" color="fg.heading">
                              {shipment.trackingNumber}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getStatusColor(shipment.status)}
                                variant="subtle"
                                px={2}
                                py={1}
                                textTransform="none"
                              >
                                {formatStatus(shipment.status)}
                              </Badge>
                            </Td>
                            <Td color="fg.muted">
                              {getCurrentLocation(shipment)}
                            </Td>
                            <Td color="fg.muted">
                              {formatDateTime(shipment.updatedAt || shipment.createdAt)}
                            </Td>
                            <Td>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<FaEllipsisV />}
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Actions for ${shipment.trackingNumber}`}
                                />
                                <MenuList>
                                  <MenuItem icon={<FaEye />} onClick={() => handleViewShipment(shipment)}>
                                    View Details
                                  </MenuItem>
                                  <MenuItem icon={<FaEdit />} onClick={() => handleEditShipment(shipment)}>
                                    Update Status
                                  </MenuItem>
                                  <MenuItem
                                    icon={<FaTrash />}
                                    onClick={() => setShipmentToDelete(shipment)}
                                    color="red.500"
                                  >
                                    Delete Shipment
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
                {/* Pagination Controls */}
                {total > 0 && (
                  <Flex justify="space-between" align="center" p={4} gap={2} wrap="wrap">
                    <Text fontSize="sm" color="fg.muted">
                      Showing {firstRow}–{lastRow} of {total}
                    </Text>
                    <HStack>
                      <Button size="sm" onClick={() => setPage(page - 1)} isDisabled={page <= 1 || loading}>
                        Prev
                      </Button>
                      <Text fontSize="sm" color="fg.muted" mx={2}>
                        Page {page} of {totalPages}
                      </Text>
                      <Button size="sm" onClick={() => setPage(page + 1)} isDisabled={page >= totalPages || loading}>
                        Next
                      </Button>
                    </HStack>
                  </Flex>
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
                      value={createForm.trackingNumber}
                      onChange={(e) => setCreateForm({ ...createForm, trackingNumber: e.target.value })}
                      placeholder="Enter tracking number"
                      autoCapitalize="characters"
                      autoComplete="off"
                    />
                    <FormHelperText>Saved in uppercase; must be unique.</FormHelperText>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    >
                      <StatusOptions />
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      placeholder="Enter current location"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Remarks</FormLabel>
                    <Textarea
                      value={createForm.remarks}
                      onChange={(e) => setCreateForm({ ...createForm, remarks: e.target.value })}
                      placeholder="Optional note shown on the first timeline entry"
                      rows={2}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onCreateClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>Create Shipment</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Update Shipment Modal */}
        <Modal isOpen={isUpdateOpen} onClose={onUpdateClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Update Shipment
              {selectedShipment && (
                <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                  {selectedShipment.trackingNumber}
                </Text>
              )}
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleUpdateShipment}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    >
                      <StatusOptions />
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={updateForm.location}
                      onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                      placeholder="Enter location"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Date &amp; Time</FormLabel>
                    <Input
                      type="datetime-local"
                      value={updateForm.date}
                      max={toDateTimeLocalValue()}
                      onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })}
                    />
                    <FormHelperText>
                      When this happened. Back-dated entries are added to the timeline without changing the current status.
                    </FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description / Remarks</FormLabel>
                    <Textarea
                      value={updateForm.remarks}
                      onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })}
                      placeholder="e.g. Arrived at Bhopal sorting hub"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onUpdateClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>Update Shipment</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* View Shipment Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Shipment Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedShipment && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" color="fg.muted" fontWeight="600">TRACKING NUMBER</Text>
                    <Text fontSize="lg" fontWeight="bold">{selectedShipment.trackingNumber}</Text>
                  </Box>
                  <Divider />
                  <Flex justify="space-between" gap={4} wrap="wrap">
                    <Box>
                      <Text fontSize="sm" color="fg.muted" fontWeight="600">STATUS</Text>
                      <Badge
                        colorScheme={getStatusColor(selectedShipment.status)}
                        variant="solid"
                        textTransform="none"
                      >
                        {formatStatus(selectedShipment.status)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="fg.muted" fontWeight="600">LOCATION</Text>
                      <Text fontWeight="600">{getCurrentLocation(selectedShipment)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="fg.muted" fontWeight="600">LAST UPDATED</Text>
                      <Text fontWeight="600">{formatDateTime(selectedShipment.updatedAt)}</Text>
                    </Box>
                  </Flex>
                  <Divider />
                  <Box>
                    <Text fontSize="sm" color="fg.muted" fontWeight="600" mb={2}>TIMELINE</Text>
                    {selectedShipment.updates?.length > 0 ? (
                      <TrackingTimeline updates={selectedShipment.updates} animate={false} />
                    ) : (
                      <Text fontSize="sm" color="fg.subtle">No tracking events yet.</Text>
                    )}
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onViewClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation */}
        <AlertDialog
          isOpen={!!shipmentToDelete}
          leastDestructiveRef={cancelDeleteRef}
          onClose={() => !submitting && setShipmentToDelete(null)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Shipment
              </AlertDialogHeader>
              <AlertDialogBody>
                Delete shipment <strong>{shipmentToDelete?.trackingNumber}</strong> and its entire
                tracking history? This cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} variant="ghost" onClick={() => setShipmentToDelete(null)} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button colorScheme="red" bg="red.500" _hover={{ bg: 'red.600' }} onClick={handleDeleteShipment} ml={3} isLoading={submitting}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
