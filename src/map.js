import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'
import { getComments, addComment, updateMarkerStatus } from './supabase.js'

console.log('map.js loaded, maplibregl:', maplibregl)

// Store marker references for management
let markerInstances = new Map()

export async function addMarkerToMap(map, { id, lat, lng, type, notes, photo_url, status }) {
  if (!map) return

  // Remove existing marker if it exists
  if (markerInstances.has(id)) {
    markerInstances.get(id).remove()
  }

  // Create popup with comments (with fallback)
  let popupContent
  try {
    popupContent = await createPopupContent(id, type, notes, photo_url, status)
  } catch (error) {
    console.warn('Using fallback popup for marker', id, ':', error)
    // Fallback to simple popup if comments fail
    popupContent = `
      <div class="marker-popup">
        <div class="marker-info">
          <strong class="marker-type">${type}</strong>
          <div class="marker-status status-${status?.toLowerCase() || 'unverified'}">${getStatusEmoji(status)} ${status || 'Unverified'}</div>
          <p class="marker-notes">${notes}</p>
          <small class="marker-id">ID: ${id}</small>
        </div>
        <div class="comment-buttons">
          <button onclick="window.deleteMarker('${id}')" class="btn-delete">Delete Pin</button>
        </div>
      </div>
    `
  }
    // Check if mobile at time of marker creation
  const isMobileDevice = window.innerWidth <= 768

  const marker = new maplibregl.Marker({
    color: getMarkerColor(type, status)
  })
    .setLngLat([lng, lat])

  if (isMobileDevice) {
    // Mobile: NO popup, custom click handler only
    marker.getElement().addEventListener('click', async (e) => {
      e.stopPropagation()
      e.preventDefault()
      await showMobileMarkerInfo(id, type, notes, photo_url, status)
    })
  } else {
    // Desktop: create and attach popup
    const popup = new maplibregl.Popup({ 
      offset: 25,
      maxWidth: '350px'
    }).setHTML(popupContent)
    
    marker.setPopup(popup)
  }

  marker.addTo(map)

  // Store marker reference
  markerInstances.set(id, marker)
  
  return marker
}

export function removeMarkerFromMap(id) {
  if (markerInstances.has(id)) {
    markerInstances.get(id).remove()
    markerInstances.delete(id)
  }
}

export function clearAllMarkers() {
  markerInstances.forEach(marker => marker.remove())
  markerInstances.clear()
}

function getMarkerColor(type, status) {
  // Base colors by type
  const baseColors = {
    'Hive': '#ffaa00',
    'Swarm': '#ff6600', 
    'Structure': '#666666',
    'Tree': '#00aa00'
  }
  
  // Status modifications
  const statusModifiers = {
    'Active': 1.0,      // Full brightness
    'Checked': 0.8,     // Slightly dimmed
    'Unverified': 0.6,  // More dimmed
    'Gone': 0.3,        // Very dimmed
    'Removed': 0.2      // Almost grey
  }
  
  const baseColor = baseColors[type] || '#333333'
  const modifier = statusModifiers[status] || 0.6
  
  if (modifier === 1.0) return baseColor
  
  // Convert hex to RGB, apply modifier, convert back
  const hex = baseColor.replace('#', '')
  const r = Math.round(parseInt(hex.substr(0, 2), 16) * modifier)
  const g = Math.round(parseInt(hex.substr(2, 2), 16) * modifier)
  const b = Math.round(parseInt(hex.substr(4, 2), 16) * modifier)
  
  return `rgb(${r}, ${g}, ${b})`
}

function getStatusEmoji(status) {
  const emojis = {
    'Unverified': '⚪',
    'Active': '🟢',
    'Checked': '🟡',
    'Gone': '🔴',
    'Removed': '🗑️'
  }
  return emojis[status] || '⚪'
}

// Create popup content with comments
async function createPopupContent(markerId, type, notes, photo_url, status) {
  let comments = []
  
  // Try to get comments, but don't fail if there's an error
  try {
    comments = await getComments(markerId)
  } catch (error) {
    console.warn('Could not fetch comments for marker', markerId, ':', error)
    comments = []
  }
  
  const commentsHtml = comments.length > 0 
    ? comments.map(comment => `
        <div class="comment">
          <div class="comment-author">${comment.author_name}</div>
          <div class="comment-text">${comment.comment_text}</div>
          <div class="comment-time">${formatDate(comment.timestamp)}</div>
        </div>
      `).join('')
    : '<div class="no-comments">No comments yet. Be the first to comment!</div>'
      const photoHtml = photo_url ? `
    <div class="marker-photo">
      <img src="${photo_url}" 
           alt="Bee sighting photo" 
           onclick="window.openPhotoModal('${photo_url}')"
           style="max-width: 100%; height: auto; border-radius: 8px; cursor: pointer;"
           onerror="this.style.display='none'; console.error('Failed to load image:', '${photo_url}');">
    </div>
  ` : `
    <div class="photo-upload-section">
      <label for="photo-${markerId}" class="status-label">Add Photo:</label>
      <input type="file" id="photo-${markerId}" accept="image/*" class="form-file" onchange="window.handleMarkerPhotoUpload('${markerId}', this)">
      <div id="photo-preview-${markerId}" style="display: none;" class="photo-preview">
        <img id="preview-img-${markerId}" alt="Photo preview">
        <button type="button" onclick="window.removeMarkerPhoto('${markerId}')" class="btn-remove-photo">✕</button>
      </div>
      <button onclick="window.uploadMarkerPhoto('${markerId}')" class="btn-update-status btn-upload-photo" style="margin-top: 8px;">Upload Photo</button>
    </div>
  `

  return `
    <div class="marker-popup">
      <div class="marker-info">
        <strong class="marker-type">${type}</strong>
        <div class="marker-status status-${status?.toLowerCase() || 'unverified'}">
          ${getStatusEmoji(status)} ${status || 'Unverified'}
        </div>
        <p class="marker-notes">${notes}</p>
        ${photoHtml}
        <small class="marker-id">ID: ${markerId}</small>
      </div>
        <div class="status-update-section">
        <label for="status-${markerId}" class="status-label">Update Status:</label>
        <select id="status-${markerId}" class="status-select">
          <option value="Unverified" ${status === 'Unverified' ? 'selected' : ''}>⚪ Unverified</option>
          <option value="Active" ${status === 'Active' ? 'selected' : ''}>🟢 Active</option>
          <option value="Checked" ${status === 'Checked' ? 'selected' : ''}>🟡 Checked</option>
          <option value="Gone" ${status === 'Gone' ? 'selected' : ''}>🔴 Gone</option>
          <option value="Removed" ${status === 'Removed' ? 'selected' : ''}>🗑️ Removed</option>
        </select>        <button onclick="window.updateMarkerStatus('${markerId}')" class="btn-update-status">Update</button>
      </div>
      
      <div class="comments-section">
        <h4>Comments (${comments.length})</h4>
        <div class="comments-list">
          ${commentsHtml}
        </div>
        
        <div class="add-comment-form">
          <input type="text" id="author-${markerId}" placeholder="Your name (optional)" class="comment-author-input">
          <textarea id="comment-${markerId}" placeholder="Add a comment..." class="comment-input"></textarea>
          <div class="comment-buttons">
            <button onclick="window.addCommentToMarker('${markerId}')" class="btn-comment">Add Comment</button>
            <button onclick="window.deleteMarker('${markerId}')" class="btn-delete">Delete Pin</button>
          </div>
        </div>
      </div>
    </div>
  `
}

// Helper function to format dates
function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
}

// Global function to add comments (called from popup buttons)
window.addCommentToMarker = async (markerId) => {
  // Try to find comment inputs in both desktop popup and mobile modal
  let authorInput = document.getElementById(`author-${markerId}`) ||
                    document.querySelector(`#mobile-marker-info input[id*="author-${markerId}"]`) ||
                    document.querySelector(`.mobile-marker-info .comment-author-input`)
  
  let commentInput = document.getElementById(`comment-${markerId}`) ||
                     document.querySelector(`#mobile-marker-info textarea[id*="comment-${markerId}"]`) ||
                     document.querySelector(`.mobile-marker-info .comment-input`)
  
  const authorName = authorInput?.value.trim() || 'Anonymous'
  const commentText = commentInput?.value.trim()
  
  if (!commentText) {
    alert('Please enter a comment')
    return
  }
  
  try {
    await addComment(markerId, commentText, authorName)
    
    // Clear the inputs
    if (authorInput) authorInput.value = ''
    if (commentInput) commentInput.value = ''
    
    // Handle mobile vs desktop refresh
    if (window.innerWidth <= 768) {
      // Mobile: close modal and show success
      closeMobileMarkerInfo()
      const successMsg = document.createElement('div')
      successMsg.textContent = 'Comment added successfully!'
      successMsg.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: var(--success); color: white; padding: 12px 20px;
        border-radius: 8px; z-index: 3000; font-weight: 600;
      `
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 2000)
    } else {
      // Desktop: refresh popup content
      const marker = markerInstances.get(markerId)
      if (marker && marker.getPopup()) {
        // Simple reload for now - could be optimized later
        location.reload()      }
    }
    
    console.log('Comment added successfully')
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Error adding comment: ' + error.message)
  }
}

// Global function to open photo modal
window.openPhotoModal = function(photoUrl) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('photoModal')
  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'photoModal'
    modal.className = 'photo-modal'
    modal.innerHTML = `
      <div class="photo-modal-content">
        <span class="photo-modal-close">&times;</span>
        <img class="photo-modal-image" alt="Bee sighting photo">
      </div>
    `
    document.body.appendChild(modal)
    
    // Add click handlers
    modal.querySelector('.photo-modal-close').onclick = () => {
      modal.style.display = 'none'
    }
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none'
      }
    }
  }
  
  // Show modal with photo
  const img = modal.querySelector('.photo-modal-image')
  img.src = photoUrl
  modal.style.display = 'block'
}

export function createMap(containerId = 'map', onMapClick) {
  console.log('createMap called with containerId:', containerId)
  const mapContainer = document.getElementById(containerId)
  console.log('mapContainer found:', mapContainer)
  if (!mapContainer) {
    console.error('Map container not found!')
    return null
  }
  // Remove any placeholder text
  mapContainer.textContent = ''
  // NYC + 5 Boroughs bounds with some cushion
  // Covers: Manhattan, Brooklyn, Queens, Bronx, Staten Island
  // Plus parts of NJ, Westchester, and Long Island for context
  const nycBounds = [
    [-74.5, 40.4], // Southwest corner (longitude, latitude)
    [-73.4, 41.0]  // Northeast corner (longitude, latitude)
  ]
  try {
    // Use environment variable if available, otherwise fallback to embedded key
    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY || 'mbriicWDtoa7yG1tmDK0'
    
    const map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`,
      center: [-73.935242, 40.730610], // Manhattan center
      zoom: 11,
      minZoom: 9,  // Prevent zooming out too far
      maxZoom: 18, // Prevent zooming in beyond street level
      maxBounds: nycBounds // Restrict panning to NYC area
    })

    console.log('MapLibre map object created:', map)

    map.on('load', () => {
      console.log('Map loaded successfully!')
    })

    map.on('error', (e) => {
      console.error('Map error:', e)
    })

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      })
    }

    return map
  } catch (error) {
    console.error('Error creating map:', error)
    return null
  }
}

/* CSS in JS - This is usually not recommended, but for the sake of the example, we're doing it */
// const style = document.createElement('style')
// style.textContent = `
// #map {
//   position: absolute;
//   top: 0; left: 0; right: 0; bottom: 0;
//   width: 100vw;
//   height: 100vh;
//   z-index: 0;
//   border: 3px solid red !important;
//   background: #222 !important;
// }
// `
// document.head.append(style)

const style = document.createElement('style')
style.textContent = `
.btn-primary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.marker-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.photo-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.photo-modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-size: 28px;
  cursor: pointer;
}

.photo-modal-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.mobile-marker-info {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
}

.mobile-marker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mobile-marker-content {
  flex: 1;
  overflow-y: auto;
}

.btn-close-mobile {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}
`
document.head.append(style)

// Global function to update marker status
window.updateMarkerStatus = async (markerId) => {
  // Try to find status select in both desktop popup and mobile modal
  let statusSelect = document.getElementById(`status-${markerId}`) ||
                     document.querySelector(`#mobile-marker-info select[id*="status-${markerId}"]`) ||
                     document.querySelector(`.mobile-marker-info select`)
  
  const newStatus = statusSelect?.value
  
  if (!newStatus) {
    alert('Please select a status')
    return
  }
    try {
    const result = await updateMarkerStatus(markerId, newStatus)
    console.log('Status update result:', result)
    
    // If we get here, the update was successful
    const marker = markerInstances.get(markerId)
    if (marker) {
      // Update marker color immediately
      marker.setColor(getMarkerColor('Hive', newStatus)) // Default to Hive for color
      
      // Show success feedback
      if (window.innerWidth <= 768) {
        closeMobileMarkerInfo()
        const successMsg = document.createElement('div')
        successMsg.textContent = 'Status updated successfully!'
        successMsg.style.cssText = `
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          background: #10B981; color: white; padding: 12px 20px;
          border-radius: 8px; z-index: 3000; font-weight: 600;
        `
        document.body.appendChild(successMsg)
        setTimeout(() => successMsg.remove(), 2000)
      } else {
        // Desktop: refresh popup content (simplified for now)
        alert('Status updated successfully!')
        location.reload()
      }
    }
    
    console.log('Status updated successfully')
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Error updating status: ' + error.message)
  }
}

// Make photo upload functions globally available for existing markers
window.handleMarkerPhotoUpload = handleMobilePhotoUpload;
window.uploadMarkerPhoto = uploadMarkerPhotoMobile;
window.removeMarkerPhoto = (markerId) => {
  const input = document.getElementById(`photo-${markerId}`);
  const preview = document.getElementById(`photo-preview-${markerId}`);
  
  if (input) input.value = '';
  if (preview) preview.style.display = 'none';
};

// Override the original updateMarkerStatus for mobile compatibility
const originalUpdateMarkerStatus = window.updateMarkerStatus;
window.updateMarkerStatus = async (markerId) => {
  if (window.innerWidth <= 768) {
    // Mobile: use mobile-specific handler
    const statusSelect = document.querySelector('#mobile-marker-info .status-select') ||
                        document.getElementById(`status-${markerId}`);
    if (statusSelect) {
      await updateMarkerStatusMobile(markerId, statusSelect.value);
    }
  } else {
    // Desktop: use original handler
    if (originalUpdateMarkerStatus) {
      await originalUpdateMarkerStatus(markerId);
    }
  }
};

// Override the original addCommentToMarker for mobile compatibility
const originalAddCommentToMarker = window.addCommentToMarker;
window.addCommentToMarker = async (markerId) => {
  if (window.innerWidth <= 768) {
    // Mobile: use mobile-specific handler
    await addCommentToMarkerMobile(markerId);
  } else {
    // Desktop: use original handler
    if (originalAddCommentToMarker) {
      await originalAddCommentToMarker(markerId);
    }
  }
};

// Override the original deleteMarker for mobile compatibility
const originalDeleteMarker = window.deleteMarker;
window.deleteMarker = async (markerId) => {
  if (window.innerWidth <= 768) {
    // Mobile: use mobile-specific handler
    await deleteMarkerMobile(markerId);
  } else {
    // Desktop: use original handler
    if (originalDeleteMarker) {
      await originalDeleteMarker(markerId);
    }
  }
};

// Mobile detection utility
function isMobile() {
  return window.innerWidth <= 768
}

// Mobile marker info container
function createMobileMarkerInfo() {
  let mobileInfo = document.getElementById('mobile-marker-info')
  if (!mobileInfo) {
    mobileInfo = document.createElement('div')
    mobileInfo.id = 'mobile-marker-info'
    mobileInfo.className = 'mobile-marker-info'
    mobileInfo.style.display = 'none'
    document.body.appendChild(mobileInfo)
  }
  return mobileInfo
}

// Show marker info in mobile-friendly way
async function showMobileMarkerInfo(markerId, type, notes, photo_url, status) {
  console.log('Showing mobile marker info for:', markerId);
  
  // Remove any existing mobile modal
  const existingModal = document.getElementById('mobile-marker-info');
  if (existingModal) {
    existingModal.remove();
  }

  // Create mobile modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'mobile-marker-info';
  modalContainer.className = 'mobile-marker-info';

  try {
    // Get marker data
    const markerData = { id: markerId, type, notes, photo_url, status };
    const content = await createPopupContent(markerId, type, notes, photo_url, status);
    
    modalContainer.innerHTML = `
      <div class="mobile-marker-content-wrapper">
        <div class="mobile-marker-header">
          <h3>Marker Details</h3>
          <button onclick="closeMobileMarkerInfo()" class="btn-close-mobile">✕</button>
        </div>
        <div class="mobile-marker-content">
          ${content}
        </div>
      </div>
    `;
    
    modalContainer.style.display = 'flex';
    document.body.appendChild(modalContainer);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Close on backdrop click
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        closeMobileMarkerInfo();
      }
    });

    // Add mobile-specific event listeners
    addMobileEventListeners(markerId);
    
  } catch (error) {
    console.error('Error creating mobile marker info:', error);
    modalContainer.innerHTML = `
      <div class="mobile-marker-content-wrapper">
        <div class="mobile-marker-header">
          <h3>Error</h3>
          <button onclick="closeMobileMarkerInfo()" class="btn-close-mobile">✕</button>
        </div>
        <div class="mobile-marker-content">
          <p>Error loading marker information: ${error.message}</p>
        </div>
      </div>
    `;
    modalContainer.style.display = 'flex';
    document.body.appendChild(modalContainer);
    document.body.style.overflow = 'hidden';
  }
}

// Add mobile-specific event listeners
function addMobileEventListeners(markerId) {
  // Status update button
  const statusBtn = document.querySelector('#mobile-marker-info .btn-update-status');
  if (statusBtn) {
    statusBtn.onclick = function() {
      const statusSelect = document.querySelector('#mobile-marker-info .status-select');
      if (statusSelect) {
        updateMarkerStatusMobile(markerId, statusSelect.value);
      }
    };
  }

  // Comment button
  const commentBtn = document.querySelector('#mobile-marker-info .btn-comment');
  if (commentBtn) {
    commentBtn.onclick = function() {
      addCommentToMarkerMobile(markerId);
    };
  }

  // Delete button
  const deleteBtn = document.querySelector('#mobile-marker-info .btn-delete');
  if (deleteBtn) {
    deleteBtn.onclick = function() {
      deleteMarkerMobile(markerId);
    };
  }

  // Photo upload
  const photoInput = document.querySelector('#mobile-marker-info input[type="file"]');
  if (photoInput) {
    photoInput.onchange = function() {
      if (this.files && this.files[0]) {
        handleMobilePhotoUpload(markerId, this);
      }
    };
  }

  // Photo upload button
  const photoUploadBtn = document.querySelector('#mobile-marker-info .btn-upload-photo');
  if (photoUploadBtn) {
    photoUploadBtn.onclick = function() {
      uploadMarkerPhotoMobile(markerId);
    };
  }
}

// Close mobile marker info
window.closeMobileMarkerInfo = function() {
  const mobileInfo = document.getElementById('mobile-marker-info')
  if (mobileInfo) {
    mobileInfo.remove()
    // Re-enable body scrolling
    document.body.style.overflow = ''
  }
}

// Make mobile functions globally available
window.showMobileToast = showMobileToast;

// Mobile-specific functions with proper error handling
async function updateMarkerStatusMobile(markerId, newStatus) {
  try {
    console.log('Updating marker status:', markerId, newStatus);
    await updateMarkerStatus(parseInt(markerId), newStatus);
    
    console.log('Status updated successfully');
    showMobileToast('Status updated successfully!');
    closeMobileMarkerInfo();
    
    // Update marker color immediately
    const marker = markerInstances.get(markerId);
    if (marker) {
      marker.setColor(getMarkerColor('Hive', newStatus));
    }
  } catch (error) {
    console.error('Status update failed:', error);
    alert('Failed to update status: ' + error.message);
  }
}

async function addCommentToMarkerMobile(markerId) {
  try {
    const nameInput = document.querySelector('#mobile-marker-info .comment-author-input');
    const commentInput = document.querySelector('#mobile-marker-info .comment-input');
    
    if (!nameInput || !commentInput) {
      console.error('Comment inputs not found');
      alert('Error: Comment form not found');
      return;
    }

    const authorName = nameInput.value.trim() || 'Anonymous';
    const commentText = commentInput.value.trim();

    if (!commentText) {
      alert('Please enter a comment');
      return;
    }

    console.log('Adding comment:', { markerId, authorName, commentText });
    
    await addComment(parseInt(markerId), commentText, authorName);
    
    console.log('Comment added successfully');
    showMobileToast('Comment added successfully!');
    closeMobileMarkerInfo();
    
  } catch (error) {
    console.error('Comment failed:', error);
    alert('Failed to add comment: ' + error.message);
  }
}

async function deleteMarkerMobile(markerId) {
  if (!confirm('Are you sure you want to delete this marker?')) {
    return;
  }

  try {
    console.log('Deleting marker:', markerId);
    await deleteMarker(parseInt(markerId));
    
    console.log('Marker deleted successfully');
    showMobileToast('Marker deleted successfully!');
    closeMobileMarkerInfo();
    
    // Remove marker from map
    removeMarkerFromMap(markerId);
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete marker: ' + error.message);
  }
}

async function handleMobilePhotoUpload(markerId, fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;

  const preview = document.querySelector(`#photo-preview-${markerId}`);
  const previewImg = document.querySelector(`#preview-img-${markerId}`);
  
  if (preview && previewImg) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

async function uploadMarkerPhotoMobile(markerId) {
  const input = document.querySelector(`#photo-${markerId}`);
  const file = input?.files?.[0];
  
  if (!file) {
    alert('Please select a photo first');
    return;
  }

  try {
    console.log('Uploading photo for marker:', markerId);
    showMobileToast('Uploading photo...');
    
    const photoResult = await uploadPhoto(file);
    console.log('Photo uploaded, result:', photoResult);
    
    await updateMarker(parseInt(markerId), { photo_url: photoResult.url });
    
    console.log('Photo saved successfully');
    showMobileToast('Photo uploaded successfully!');
    closeMobileMarkerInfo();
    
  } catch (error) {
    console.error('Photo upload failed:', error);
    alert('Failed to upload photo: ' + error.message);
  }
}

// Mobile toast notification
function showMobileToast(message) {
  const toast = document.createElement('div');
  toast.className = 'mobile-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #10B981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

