
const SVG_NS = "http://www.w3.org/2000/svg";


// ============================================================
// SETTINGS
// ============================================================

const centerX = 200;
const centerY = 190;

const gaugeRadius = 150;

let line1_target = 20000
let line2_target = 40000


// ============================================================
// CONVERT VALUE TO ANGLE
// ============================================================

function valueToAngle(value, max) {

    value = Math.max(0, Math.min(max, value));

    return 180 + (value / max) * 180;
}


// ============================================================
// POLAR COORDINATE
// ============================================================

function polar(value, radius, max) {

    const angle = valueToAngle(value, max);

    const radians =
        angle * Math.PI / 180;


    return {

        x: centerX +
           Math.cos(radians) * radius,

        y: centerY +
           Math.sin(radians) * radius

    };
}


// ============================================================
// CREATE ARC
// ============================================================

function createArc(svg, startValue, endValue, color, max) {

    const start =
        polar(startValue, gaugeRadius, max);

    const end =
        polar(endValue, gaugeRadius, max);


    const path =
        document.createElementNS(
            SVG_NS,
            "path"
        );


    const d = `

        M ${start.x} ${start.y}

        A ${gaugeRadius} ${gaugeRadius}
          0 0 1
          ${end.x} ${end.y}

    `;


    path.setAttribute("d", d);

    path.setAttribute(
        "fill",
        "none"
    );

    path.setAttribute(
        "stroke",
        color
    );

    path.setAttribute(
        "stroke-width",
        "24"
    );


    svg.appendChild(path);
}


// ============================================================
// CREATE TICKS
// ============================================================

function createTicks(svg, max) {
    let tick_var = 165;
    for (
        let value = 0;
        value <= max;
        value += max/4
    ) {


        const outer =
            polar(value, tick_var, max);


        let tickLength = 12;


        if (value % 20 === 0) {

            tickLength = 18;

        }


        const inner =
            polar(
                value,
                tick_var - tickLength, 
                max
            );


        const line =
            document.createElementNS(
                SVG_NS,
                "line"
            );


        line.setAttribute(
            "x1",
            inner.x
        );

        line.setAttribute(
            "y1",
            inner.y
        );

        line.setAttribute(
            "x2",
            outer.x
        );

        line.setAttribute(
            "y2",
            outer.y
        );

        line.setAttribute(
            "stroke",
            "#222"
        );

        line.setAttribute(
            "stroke-width",
            "2"
        );


        svg.appendChild(line);


        // Only print numbers every 20

        if (value % 20 === 0) {


            const position =
                polar(value, 180, max);


            const text =
                document.createElementNS(
                    SVG_NS,
                    "text"
                );


            text.setAttribute(
                "x",
                position.x
            );

            text.setAttribute(
                "y",
                position.y + 6
            );

            text.setAttribute(
                "text-anchor",
                "middle"
            );

            text.setAttribute(
                "font-size",
                "18"
            );


            text.textContent =
                value/1000+"k";


            svg.appendChild(text);

        }

    }

}


// ============================================================
// CREATE NEEDLE
// ============================================================

function createNeedle(
    svg,
    id,
    color,
    width
) {


    const needle =
        document.createElementNS(
            SVG_NS,
            "line"
        );


    needle.setAttribute(
        "id",
        id
    );


    needle.setAttribute(
        "x1",
        centerX
    );

    needle.setAttribute(
        "y1",
        centerY
    );


    needle.setAttribute(
        "x2",
        centerX - 140
    );

    needle.setAttribute(
        "y2",
        centerY
    );


    needle.setAttribute(
        "stroke",
        color
    );


    needle.setAttribute(
        "stroke-width",
        width
    );


    needle.setAttribute(
        "stroke-linecap",
        "round"
    );


    needle.style.transformOrigin =
        `${centerX}px ${centerY}px`;


    needle.style.transition =
        "transform 0.7s ease";


    svg.appendChild(needle);

}


// ============================================================
// CREATE COMPLETE GAUGE
// ============================================================

function createGauge(name,target) {


    const svg =
        document.getElementById(
            "gauge-" + name
        );


    // --------------------------------
    // Coloured zones
    // --------------------------------

    createArc(
        svg,
        0,
        target/2,
        "#d9534f",
        target*2
    );


    createArc(
        svg,
        target/2,
        target,
        "#f0c541",
        target*2
    );


    createArc(
        svg,
        target,
        target*2,
        "#5cb85c",
        target*2
    );


    // --------------------------------
    // Ticks
    // --------------------------------

    createTicks(svg, target*2);


    // --------------------------------
    // Needles
    // --------------------------------

    createNeedle(
        svg,
        name + "-needle-FourWeeks",
        "#222",
        5
    );


    createNeedle(
        svg,
        name + "-needle-currentwkavg",
        "#1a73e8",
        5
    );


    createNeedle(
        svg,
        name + "-needle-today",
        "#d93025",
        5
    );


    // --------------------------------
    // Centre pivot
    // --------------------------------

    const center =
        document.createElementNS(
            SVG_NS,
            "circle"
        );


    center.setAttribute(
        "cx",
        centerX
    );

    center.setAttribute(
        "cy",
        centerY
    );

    center.setAttribute(
        "r",
        10
    );

    center.setAttribute(
        "fill",
        "#222"
    );


    svg.appendChild(center);

}


// ============================================================
// MOVE NEEDLE
// ============================================================

function moveNeedle(id, value,target) {


    value =
        Math.max(
            0,
            Math.min(target*2, Number(value))
        );


    const angle =
        (value / (target*2)) * 180;


    document
        .getElementById(id)
        .style.transform =
        `rotate(${angle}deg)`;

}


// ============================================================
// UPDATE ONE GAUGE
// ============================================================

function updateGauge(name, data,target) {


    moveNeedle(
        name + "-needle-today",
        data.today,
        target
    );


    moveNeedle(
        name + "-needle-currentwkavg",
        data.currentwkavg,
        target
    );


    moveNeedle(
        name + "-needle-FourWeeks",
        data.FourWeeks,
        target
    );


    document.getElementById(
        name + "-today"
    ).textContent =
        data.today ;


    document.getElementById(
        name + "-currentwkavg"
    ).textContent =
        data.currentwkavg ;


    document.getElementById(
        name + "-FourWeeks"
    ).textContent =
        data.FourWeeks ;

}


// ============================================================
// GET VALUES FROM FLASK
// ============================================================

function getGaugeData() {


    fetch("/get_gauge_data")

        .then(
            response =>
                response.json()
        )

        .then(
            data => {


                updateGauge(
                    "line1",
                    data.line1,
                    line1_target
                );


                updateGauge(
                    "line2",
                    data.line2,
                    line2_target
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Gauge error:",
                    error
                );

            }
        );

}


// ============================================================
// START
// ============================================================

createGauge("line1",line1_target);

createGauge("line2",line2_target);


getGaugeData();


// Update every 2 seconds

setInterval(
    getGaugeData,
    2000
);
