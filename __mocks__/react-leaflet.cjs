const React = require('react');

// Helper to filter out non-DOM props and handle special cases
const filterProps = (props) => {
  const { children, ...rest } = props;
  const domProps = {};
  
  // Only keep valid DOM props
  Object.entries(rest).forEach(([key, value]) => {
    // Handle special cases
    if (key === 'center' || key === 'position') {
      domProps['data-position'] = JSON.stringify(value);
    } else if (key === 'zoom') {
      domProps['data-zoom'] = value.toString();
    } else if (key === 'url') {
      domProps['data-url'] = value;
    } else if (typeof value === 'boolean') {
      domProps[key.toLowerCase()] = value.toString();
    } else if (typeof value === 'function') {
      // Store function name for testing
      domProps[`data-${key}`] = value.name || 'anonymous';
    } else {
      domProps[key.toLowerCase()] = value;
    }
  });
  
  return domProps;
};

// Helper to create a mock event handler
const createMockHandler = (name) => (event) => {
  // Store the event in a data attribute for testing
  event.target.setAttribute(`data-${name}-called`, 'true');
  return event;
};

module.exports = {
  MapContainer: ({ children, ...props }) => {
    const domProps = filterProps(props);
    return React.createElement('div', {
      ...domProps,
      'data-testid': 'map-container',
      onClick: createMockHandler('map-click'),
      onZoom: createMockHandler('map-zoom'),
      onMove: createMockHandler('map-move')
    }, children);
  },
  TileLayer: (props) => {
    const domProps = filterProps(props);
    return React.createElement('div', {
      ...domProps,
      'data-testid': 'tile-layer',
      'data-attribution': props.attribution || ''
    });
  },
  Marker: (props) => {
    const domProps = filterProps(props);
    return React.createElement('div', {
      ...domProps,
      'data-testid': 'marker',
      onClick: createMockHandler('marker-click'),
      onDrag: createMockHandler('marker-drag'),
      onDragEnd: createMockHandler('marker-dragend')
    });
  },
  Popup: ({ children, ...props }) => {
    const domProps = filterProps(props);
    return React.createElement('div', {
      ...domProps,
      'data-testid': 'popup',
      'data-position': JSON.stringify(props.position || [0, 0])
    }, children);
  },
  useMap: () => ({
    setView: jest.fn(),
    flyTo: jest.fn(),
    getCenter: () => ({ lat: 0, lng: 0 }),
    getZoom: () => 13
  }),
  useMapEvents: (events) => {
    // Store event handlers for testing
    Object.entries(events).forEach(([name, handler]) => {
      if (typeof handler === 'function') {
        handler.name = name;
      }
    });
    return null;
  }
}; 