package com.paf.backend.booking.repository;

import com.paf.backend.booking.model.Booking;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface BookingRepository extends MongoRepository<Booking, Long> {

    List<Booking> findByUserEmailIgnoreCase(String userEmail);

    List<Booking> findByStatus(String status);

    List<Booking> findByFacilityId(Long facilityId);

    // Find overlapping bookings for conflict detection (only PENDING or APPROVED)
    @Query("{ 'facilityId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findConflictingBookings(Long facilityId, LocalDateTime startTime, LocalDateTime endTime);

    // Same but exclude a specific booking id (for update scenarios)
    @Query("{ 'facilityId': ?0, '_id': { $ne: ?3 }, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findConflictingBookingsExcluding(Long facilityId, LocalDateTime startTime,
                                                    LocalDateTime endTime, Long excludeId);

    // All bookings for a facility that overlap a full day window (for timeline view)
    @Query("{ 'facilityId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findByFacilityIdAndDay(Long facilityId, LocalDateTime dayStart, LocalDateTime dayEnd);
}
