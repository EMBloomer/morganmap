/**
 * Simple test script for MorganMap Backend API endpoints
 *
 * Usage:
 *   node test-endpoints.js
 *
 * Make sure the server is running on http://localhost:3001 before running this script
 */

const BASE_URL = 'http://localhost:3001';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('Testing: GET /health', colors.bold);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();

    if (response.ok && data.status === 'ok') {
      log('✓ Health check passed', colors.green);
      log(`  Response: ${JSON.stringify(data, null, 2)}`);
      return true;
    } else {
      log('✗ Health check failed', colors.red);
      log(`  Response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    log('✗ Health check error', colors.red);
    log(`  Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testFetchUrl() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('Testing: POST /api/fetch-url', colors.bold);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    // Test with example.com
    const response = await fetch(`${BASE_URL}/api/fetch-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com',
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✓ Fetch URL passed', colors.green);
      log(`  URL: ${data.url}`);
      log(`  Content Type: ${data.contentType}`);
      log(`  Content Length: ${data.content?.length || 0} characters`);
      log(`  Content Preview: ${data.content?.substring(0, 100)}...`);
      return true;
    } else {
      log('✗ Fetch URL failed', colors.red);
      log(`  Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    log('✗ Fetch URL error', colors.red);
    log(`  Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testFetchUrlInvalid() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('Testing: POST /api/fetch-url (Invalid URL)', colors.bold);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const response = await fetch(`${BASE_URL}/api/fetch-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'not-a-valid-url',
      }),
    });

    const data = await response.json();

    if (!response.ok && !data.success) {
      log('✓ Invalid URL correctly rejected', colors.green);
      log(`  Error: ${data.error}`);
      return true;
    } else {
      log('✗ Invalid URL should have been rejected', colors.red);
      return false;
    }
  } catch (error) {
    log('✗ Test error', colors.red);
    log(`  Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testGeocode() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('Testing: POST /api/geocode', colors.bold);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const response = await fetch(`${BASE_URL}/api/geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: 'Broadway Theatre, New York, NY',
        provider: 'nominatim',
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✓ Geocode passed', colors.green);
      log(`  Latitude: ${data.latitude}`);
      log(`  Longitude: ${data.longitude}`);
      log(`  Formatted: ${data.formattedAddress}`);
      log(`  Provider: ${data.provider}`);
      return true;
    } else {
      log('✗ Geocode failed', colors.red);
      log(`  Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    log('✗ Geocode error', colors.red);
    log(`  Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testExtractTour() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('Testing: POST /api/extract-tour', colors.bold);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  // Sample HTML content for testing
  const sampleHtml = `
    <html>
      <head><title>Spring Theatre Tour 2025</title></head>
      <body>
        <h1>Spring Theatre Tour 2025</h1>
        <p>Join us for an exciting tour across major cities!</p>
        <div class="venue">
          <h2>Broadway Theatre</h2>
          <p>Location: 1681 Broadway, New York, NY</p>
          <p>Dates: March 15-20, 2025</p>
        </div>
        <div class="venue">
          <h2>Pantages Theatre</h2>
          <p>Location: 6233 Hollywood Blvd, Los Angeles, CA</p>
          <p>Dates: March 25-30, 2025</p>
        </div>
      </body>
    </html>
  `;

  try {
    log('  Note: This test requires an AI API key to be configured', colors.yellow);

    const response = await fetch(`${BASE_URL}/api/extract-tour`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent: sampleHtml,
        url: 'https://example.com/tour',
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✓ Extract tour passed', colors.green);
      log(`  Provider: ${data.provider}`);
      log(`  Tour Name: ${data.data.name}`);
      log(`  Venues Found: ${data.data.venues?.length || 0}`);
      if (data.data.venues && data.data.venues.length > 0) {
        log(`  First Venue: ${data.data.venues[0].name}`);
      }
      return true;
    } else {
      if (data.error?.includes('No AI API key')) {
        log('⚠ Extract tour skipped (no API key configured)', colors.yellow);
        log(`  Error: ${data.error}`, colors.yellow);
        return null; // null means skipped, not failed
      } else {
        log('✗ Extract tour failed', colors.red);
        log(`  Error: ${data.error}`);
        return false;
      }
    }
  } catch (error) {
    log('✗ Extract tour error', colors.red);
    log(`  Error: ${error.message}`, colors.red);
    return false;
  }
}

async function runTests() {
  log('\n╔═══════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                           ║', colors.cyan);
  log('║  🧪  MorganMap Backend API Test Suite                    ║', colors.cyan);
  log('║                                                           ║', colors.cyan);
  log('╚═══════════════════════════════════════════════════════════╝', colors.cyan);

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  // Run tests
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Fetch URL', fn: testFetchUrl },
    { name: 'Invalid URL Rejection', fn: testFetchUrlInvalid },
    { name: 'Geocode', fn: testGeocode },
    { name: 'Extract Tour', fn: testExtractTour },
  ];

  for (const test of tests) {
    const result = await test.fn();
    if (result === true) {
      results.passed++;
    } else if (result === false) {
      results.failed++;
    } else {
      results.skipped++;
    }
    // Add small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  log('\n╔═══════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                           ║', colors.cyan);
  log('║  Test Summary                                             ║', colors.cyan);
  log('║                                                           ║', colors.cyan);
  log('╚═══════════════════════════════════════════════════════════╝', colors.cyan);
  log(`\n  Total Tests: ${tests.length}`);
  log(`  Passed: ${results.passed}`, colors.green);
  log(`  Failed: ${results.failed}`, results.failed > 0 ? colors.red : colors.reset);
  log(`  Skipped: ${results.skipped}`, colors.yellow);

  const successRate = ((results.passed / (tests.length - results.skipped)) * 100).toFixed(1);
  log(`\n  Success Rate: ${successRate}%`, results.failed === 0 ? colors.green : colors.yellow);

  if (results.failed === 0 && results.passed > 0) {
    log('\n✓ All tests passed!', colors.green);
  } else if (results.failed > 0) {
    log('\n✗ Some tests failed. Please check the output above.', colors.red);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  log('\n✗ Test suite error:', colors.red);
  log(`  ${error.message}`, colors.red);
  log('\n  Make sure the backend server is running on http://localhost:3001', colors.yellow);
  process.exit(1);
});
