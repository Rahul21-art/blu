/**
 * HUMAN-REALISTIC PROCEDURAL ANIMATIONS FOR BLU
 * 
 * Key principles:
 * - Large, flowing movements (not twitchy micro-rotations)
 * - Natural easing curves (ease-in-out, not linear)
 * - Weight shift and counter-balance
 * - Spine undulation and hip drive
 * - Head stabilization (opposite spine motion)
 * - Breathing and gentle sway in idle
 * - Foot contact moments and push-off
 * - Arm swing weight and momentum
 */

export function createRealisticAnimations(mixer, actions, bones, BLU_BONES) {
    const boneMap = {};
    bones.forEach(b => boneMap[b.name] = b);
    
    const findBone = name => boneMap[name] || bones.find(b => 
        b.name.toLowerCase() === String(name).toLowerCase());
    
    const rest = new Map(bones.map(b => [b.name, b.quaternion.clone()]));

    function dq(x = 0, y = 0, z = 0) {
        return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'XYZ'));
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function track(key, keyframes) {
        const b = findBone(BLU_BONES[key]);
        if (!b) return null;
        const base = rest.get(b.name);
        const times = [], values = [];
        for (const k of keyframes) {
            const q = base.clone().multiply(dq(k.x || 0, k.y || 0, k.z || 0));
            times.push(k.t);
            values.push(q.x, q.y, q.z, q.w);
        }
        return new THREE.QuaternionKeyframeTrack(b.name + '.quaternion', times, values);
    }

    function clip(name, duration, tracks, loop = THREE.LoopRepeat) {
        const c = new THREE.AnimationClip(name, duration, tracks.filter(Boolean));
        const a = mixer.clipAction(c);
        a.setLoop(loop, loop === THREE.LoopRepeat ? Infinity : 1);
        a.clampWhenFinished = loop === THREE.LoopOnce;
        a.zeroSlopeAtStart = true;
        a.zeroSlopeAtEnd = true;
        a.enabled = true;
        actions[name] = a;
    }

    // ============================================================
    // IDLE: Natural standing with breathing + gentle sway
    // ============================================================
    clip('idle', 6, [
        // Breathing in spine/torso (gentle forward/back lean)
        track('HIP', [
            {t: 0, y: 0, z: 0},
            {t: 1.5, y: 0.04, z: 0.02},
            {t: 3, y: 0, z: -0.02},
            {t: 4.5, y: -0.04, z: 0.02},
            {t: 6, y: 0, z: 0}
        ]),
        // Spine undulation (counter-balance to hip)
        track('SPINE1', [
            {t: 0, x: -0.06, z: 0},
            {t: 1.5, x: -0.04, z: 0.015},
            {t: 3, x: -0.06, z: -0.015},
            {t: 4.5, x: -0.08, z: 0.015},
            {t: 6, x: -0.06, z: 0}
        ]),
        // Head stabilization (opposite spine, slight drift)
        track('HEAD', [
            {t: 0, y: 0.03, x: -0.01},
            {t: 1.5, y: 0.02, x: 0.01},
            {t: 3, y: 0.03, x: -0.01},
            {t: 4.5, y: 0.01, x: 0.02},
            {t: 6, y: 0.03, x: -0.01}
        ]),
        // Left arm: relaxed at side with slight sway
        track('L_UPPERARM', [
            {t: 0, z: -1.57, x: -0.05},
            {t: 3, z: -1.54, x: 0.02},
            {t: 6, z: -1.57, x: -0.05}
        ]),
        // Right arm: relaxed at side with slight sway
        track('R_UPPERARM', [
            {t: 0, z: 1.57, x: 0.05},
            {t: 3, z: 1.54, x: -0.02},
            {t: 6, z: 1.57, x: 0.05}
        ]),
        // Forearms: natural slight bend
        track('L_FOREARM', [
            {t: 0, x: 0.5},
            {t: 6, x: 0.5}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.5},
            {t: 6, x: -0.5}
        ]),
        // Hands: neutral
        track('L_HAND', [
            {t: 0, z: -0.2, x: 0.1},
            {t: 6, z: -0.2, x: 0.1}
        ]),
        track('R_HAND', [
            {t: 0, z: 0.2, x: -0.1},
            {t: 6, z: 0.2, x: -0.1}
        ])
    ]);

    // ============================================================
    // WALK: Full-body locomotion with natural weight transfer
    // ============================================================
    const walkDur = 1.2;
    clip('walk', walkDur, [
        // Hips: forward shift + rotation (weight from one leg to other)
        track('HIP', [
            {t: 0, y: 0, z: 0},
            {t: 0.3, y: 0.08, z: 0.1},
            {t: 0.6, y: 0, z: 0},
            {t: 0.9, y: -0.08, z: -0.1},
            {t: walkDur, y: 0, z: 0}
        ]),
        // L Thigh: full stride swing
        track('L_THIGH', [
            {t: 0, x: 0.6},
            {t: 0.15, x: -0.1},
            {t: 0.3, x: -0.8},
            {t: 0.45, x: -0.3},
            {t: 0.6, x: 0.6}
        ]),
        // R Thigh: opposite phase
        track('R_THIGH', [
            {t: 0, x: -0.6},
            {t: 0.15, x: -0.3},
            {t: 0.3, x: 0.6},
            {t: 0.45, x: 0.1},
            {t: 0.6, x: -0.6}
        ]),
        // L Calf: knee flexion on swing, extension on ground
        track('L_CALF', [
            {t: 0, x: 0.2},
            {t: 0.15, x: 0.5},
            {t: 0.3, x: 1.1},
            {t: 0.45, x: 0.3},
            {t: 0.6, x: 0.2}
        ]),
        // R Calf: opposite
        track('R_CALF', [
            {t: 0, x: -0.2},
            {t: 0.15, x: -0.3},
            {t: 0.3, x: -0.2},
            {t: 0.45, x: -0.5},
            {t: 0.6, x: -0.2}
        ]),
        // Spine: counter-rotation (opposes hip yaw)
        track('SPINE1', [
            {t: 0, z: -0.08, x: -0.05},
            {t: 0.3, z: 0.08, x: -0.06},
            {t: 0.6, z: -0.08, x: -0.05}
        ]),
        // L Upperarm: opposite L Thigh (right arm forward when L leg forward)
        track('L_UPPERARM', [
            {t: 0, x: 0.6, z: -1.57},
            {t: 0.3, x: -0.4, z: -1.57},
            {t: 0.6, x: 0.6, z: -1.57}
        ]),
        // R Upperarm: opposite R Thigh
        track('R_UPPERARM', [
            {t: 0, x: -0.6, z: 1.57},
            {t: 0.3, x: 0.6, z: 1.57},
            {t: 0.6, x: -0.6, z: 1.57}
        ]),
        // L Forearm: natural bend following arm swing
        track('L_FOREARM', [
            {t: 0, x: 0.3},
            {t: 0.3, x: -0.6},
            {t: 0.6, x: 0.3}
        ]),
        // R Forearm: opposite
        track('R_FOREARM', [
            {t: 0, x: -0.3},
            {t: 0.3, x: 0.6},
            {t: 0.6, x: -0.3}
        ]),
        // Head: stabilization (opposite spine)
        track('HEAD', [
            {t: 0, z: 0.06, y: -0.02},
            {t: 0.3, z: -0.06, y: 0.02},
            {t: 0.6, z: 0.06, y: -0.02}
        ])
    ]);

    // ============================================================
    // RUN: Exaggerated walk (larger strides, higher bounce)
    // ============================================================
    const runDur = 0.7;
    clip('run', runDur, [
        track('HIP', [
            {t: 0, y: 0.1, z: 0},
            {t: 0.175, y: 0.15, z: 0.15},
            {t: 0.35, y: 0.1, z: 0},
            {t: 0.525, y: -0.15, z: -0.15},
            {t: runDur, y: 0.1, z: 0}
        ]),
        track('L_THIGH', [
            {t: 0, x: 1.2},
            {t: 0.1, x: -0.2},
            {t: 0.175, x: -1.4},
            {t: 0.35, x: 1.2}
        ]),
        track('R_THIGH', [
            {t: 0, x: -1.4},
            {t: 0.1, x: 1.2},
            {t: 0.175, x: -0.2},
            {t: 0.35, x: -1.4}
        ]),
        track('L_CALF', [
            {t: 0, x: 0.5},
            {t: 0.1, x: 0.8},
            {t: 0.175, x: 1.4},
            {t: 0.35, x: 0.5}
        ]),
        track('R_CALF', [
            {t: 0, x: -0.5},
            {t: 0.1, x: -0.5},
            {t: 0.175, x: -0.8},
            {t: 0.35, x: -0.5}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.15, z: -0.12},
            {t: 0.175, x: -0.18, z: 0.12},
            {t: runDur, x: -0.15, z: -0.12}
        ]),
        track('L_UPPERARM', [
            {t: 0, x: 1.2, z: -1.57},
            {t: 0.175, x: -0.8, z: -1.57},
            {t: runDur, x: 1.2, z: -1.57}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: -1.2, z: 1.57},
            {t: 0.175, x: 0.8, z: 1.57},
            {t: runDur, x: -1.2, z: 1.57}
        ]),
        track('L_FOREARM', [
            {t: 0, x: 0.6},
            {t: 0.175, x: -0.8},
            {t: runDur, x: 0.6}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.6},
            {t: 0.175, x: 0.8},
            {t: runDur, x: -0.6}
        ]),
        track('HEAD', [
            {t: 0, z: 0.1, x: -0.05},
            {t: 0.175, z: -0.1, x: 0.05},
            {t: runDur, z: 0.1, x: -0.05}
        ])
    ]);

    // ============================================================
    // WAVE: Friendly gesture with full body involvement
    // ============================================================
    clip('wave', 2.2, [
        track('R_CLAVICLE', [
            {t: 0, x: 0},
            {t: 0.3, x: -0.3},
            {t: 1.6, x: -0.3},
            {t: 2.2, x: 0}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: 0.3, z: 1.4},
            {t: 0.3, x: -1.2, z: 0.6},
            {t: 1.6, x: -1.2, z: 0.6},
            {t: 2.2, x: 0.3, z: 1.4}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.4},
            {t: 0.3, x: -2.0},
            {t: 0.7, x: -1.5},
            {t: 1.1, x: -2.1},
            {t: 1.6, x: -1.5},
            {t: 2.2, x: -0.4}
        ]),
        track('R_HAND', [
            {t: 0, z: 0.2},
            {t: 0.5, z: 0.4},
            {t: 0.8, z: -0.3},
            {t: 1.1, z: 0.4},
            {t: 1.4, z: -0.3},
            {t: 2.2, z: 0.2}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 1.1, x: -0.05},
            {t: 2.2, x: -0.08}
        ]),
        track('HEAD', [
            {t: 0, y: 0.05},
            {t: 1.1, y: 0.08},
            {t: 2.2, y: 0.05}
        ]),
        track('L_UPPERARM', [
            {t: 0, z: -1.57},
            {t: 2.2, z: -1.57}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // TALK: Head nods with open mouth + arm gestures
    // ============================================================
    clip('talk', 2.4, [
        track('HEAD', [
            {t: 0, y: 0},
            {t: 0.4, y: 0.15},
            {t: 0.8, y: -0.12},
            {t: 1.2, y: 0.1},
            {t: 1.6, y: -0.08},
            {t: 2.0, y: 0.12},
            {t: 2.4, y: 0}
        ]),
        track('NECK', [
            {t: 0, x: 0},
            {t: 0.6, x: 0.08},
            {t: 1.2, x: 0},
            {t: 1.8, x: 0.06},
            {t: 2.4, x: 0}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: 0.2, z: 1.57},
            {t: 0.6, x: -0.6, z: 1.3},
            {t: 1.2, x: 0.1, z: 1.57},
            {t: 1.8, x: -0.5, z: 1.4},
            {t: 2.4, x: 0.2, z: 1.57}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.3},
            {t: 0.6, x: -0.9},
            {t: 1.2, x: -0.2},
            {t: 1.8, x: -0.8},
            {t: 2.4, x: -0.3}
        ]),
        track('L_UPPERARM', [
            {t: 0, z: -1.57},
            {t: 2.4, z: -1.57}
        ]),
        track('JAW', [
            {t: 0, x: 0},
            {t: 0.2, x: 0.4},
            {t: 0.35, x: 0.1},
            {t: 0.5, x: 0.35},
            {t: 0.7, x: 0.08},
            {t: 0.9, x: 0.38},
            {t: 1.1, x: 0.1},
            {t: 1.3, x: 0.36},
            {t: 1.5, x: 0.09},
            {t: 1.7, x: 0.39},
            {t: 1.9, x: 0.1},
            {t: 2.1, x: 0.37},
            {t: 2.4, x: 0}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 1.2, x: -0.06},
            {t: 2.4, x: -0.08}
        ])
    ]);

    // ============================================================
    // HAPPY: Full body celebration
    // ============================================================
    clip('happy', 2.0, [
        track('L_UPPERARM', [
            {t: 0, x: -0.5, z: -1.2},
            {t: 0.5, x: -1.1, z: -0.9},
            {t: 1.0, x: -0.4, z: -1.2},
            {t: 1.5, x: -1.0, z: -0.95},
            {t: 2.0, x: -0.5, z: -1.2}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: 0.5, z: 1.2},
            {t: 0.5, x: 1.1, z: 0.9},
            {t: 1.0, x: 0.4, z: 1.2},
            {t: 1.5, x: 1.0, z: 0.95},
            {t: 2.0, x: 0.5, z: 1.2}
        ]),
        track('HEAD', [
            {t: 0, x: -0.1, y: 0.05},
            {t: 0.5, x: 0.12, y: -0.08},
            {t: 1.0, x: -0.08, y: 0.06},
            {t: 1.5, x: 0.10, y: -0.07},
            {t: 2.0, x: -0.1, y: 0.05}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.12},
            {t: 0.5, x: -0.05},
            {t: 1.0, x: -0.12},
            {t: 1.5, x: -0.06},
            {t: 2.0, x: -0.12}
        ]),
        track('L_FOREARM', [
            {t: 0, x: -0.3},
            {t: 0.5, x: 0.5},
            {t: 1.0, x: -0.3},
            {t: 1.5, x: 0.4},
            {t: 2.0, x: -0.3}
        ]),
        track('R_FOREARM', [
            {t: 0, x: 0.3},
            {t: 0.5, x: -0.5},
            {t: 1.0, x: 0.3},
            {t: 1.5, x: -0.4},
            {t: 2.0, x: 0.3}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // SAD: Shoulders down, head forward, arms limp
    // ============================================================
    clip('sad', 2.8, [
        track('SPINE1', [
            {t: 0, x: 0.15},
            {t: 1.4, x: 0.3},
            {t: 2.8, x: 0.15}
        ]),
        track('NECK', [
            {t: 0, x: 0.12},
            {t: 1.4, x: 0.25},
            {t: 2.8, x: 0.12}
        ]),
        track('HEAD', [
            {t: 0, x: 0.2, y: -0.08},
            {t: 1.0, x: 0.35, y: -0.1},
            {t: 2.0, x: 0.25, y: -0.09},
            {t: 2.8, x: 0.2, y: -0.08}
        ]),
        track('L_UPPERARM', [
            {t: 0, x: 0.4, z: -1.57},
            {t: 2.8, x: 0.4, z: -1.57}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: -0.4, z: 1.57},
            {t: 2.8, x: -0.4, z: 1.57}
        ]),
        track('L_FOREARM', [
            {t: 0, x: 0.6},
            {t: 1.4, x: 0.8},
            {t: 2.8, x: 0.6}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.6},
            {t: 1.4, x: -0.8},
            {t: 2.8, x: -0.6}
        ]),
        track('HIP', [
            {t: 0, y: -0.05},
            {t: 1.4, y: -0.1},
            {t: 2.8, y: -0.05}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // ANGRY: Tense body, clenched fists
    // ============================================================
    clip('angry', 1.8, [
        track('SPINE1', [
            {t: 0, x: -0.15},
            {t: 0.4, x: -0.25},
            {t: 0.8, x: -0.15},
            {t: 1.2, x: -0.24},
            {t: 1.8, x: -0.15}
        ]),
        track('HEAD', [
            {t: 0, x: -0.12, y: -0.08},
            {t: 0.4, x: -0.22, y: -0.1},
            {t: 0.8, x: -0.12, y: -0.08},
            {t: 1.2, x: -0.20, y: -0.09},
            {t: 1.8, x: -0.12, y: -0.08}
        ]),
        track('L_UPPERARM', [
            {t: 0, x: 0.2, z: -1.4},
            {t: 0.4, x: 0.5, z: -1.3},
            {t: 0.8, x: 0.2, z: -1.4},
            {t: 1.2, x: 0.48, z: -1.32},
            {t: 1.8, x: 0.2, z: -1.4}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: -0.2, z: 1.4},
            {t: 0.4, x: -0.5, z: 1.3},
            {t: 0.8, x: -0.2, z: 1.4},
            {t: 1.2, x: -0.48, z: 1.32},
            {t: 1.8, x: -0.2, z: 1.4}
        ]),
        track('L_FOREARM', [
            {t: 0, x: 0.3},
            {t: 0.4, x: 0.7},
            {t: 0.8, x: 0.3},
            {t: 1.2, x: 0.65},
            {t: 1.8, x: 0.3}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.3},
            {t: 0.4, x: -0.7},
            {t: 0.8, x: -0.3},
            {t: 1.2, x: -0.65},
            {t: 1.8, x: -0.3}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // SURPRISED: Arms up + mouth open
    // ============================================================
    clip('surprised', 1.6, [
        track('L_UPPERARM', [
            {t: 0, x: -0.3, z: -1.2},
            {t: 0.3, x: -1.4, z: -0.5},
            {t: 1.1, x: -1.4, z: -0.5},
            {t: 1.6, x: -0.3, z: -1.2}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: 0.3, z: 1.2},
            {t: 0.3, x: 1.4, z: 0.5},
            {t: 1.1, x: 1.4, z: 0.5},
            {t: 1.6, x: 0.3, z: 1.2}
        ]),
        track('L_FOREARM', [
            {t: 0, x: 0.2},
            {t: 0.3, x: -0.8},
            {t: 1.1, x: -0.8},
            {t: 1.6, x: 0.2}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.2},
            {t: 0.3, x: 0.8},
            {t: 1.1, x: 0.8},
            {t: 1.6, x: -0.2}
        ]),
        track('HEAD', [
            {t: 0, x: -0.08, y: 0.05},
            {t: 0.3, x: -0.18, y: -0.12},
            {t: 1.1, x: -0.18, y: -0.12},
            {t: 1.6, x: -0.08, y: 0.05}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 0.3, x: 0.05},
            {t: 1.1, x: 0.05},
            {t: 1.6, x: -0.08}
        ]),
        track('JAW', [
            {t: 0, x: 0},
            {t: 0.3, x: 0.6},
            {t: 1.1, x: 0.6},
            {t: 1.6, x: 0}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // LAUGH: Full body shaking + mouth open
    // ============================================================
    clip('laugh', 2.2, [
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 0.2, x: 0.1},
            {t: 0.4, x: -0.12},
            {t: 0.6, x: 0.08},
            {t: 0.8, x: -0.1},
            {t: 1.0, x: 0.09},
            {t: 1.2, x: -0.11},
            {t: 1.4, x: 0.1},
            {t: 1.6, x: -0.09},
            {t: 1.8, x: 0.09},
            {t: 2.0, x: -0.1},
            {t: 2.2, x: -0.08}
        ]),
        track('HEAD', [
            {t: 0, x: 0.05, y: -0.08},
            {t: 0.2, x: -0.08, y: 0.05},
            {t: 0.4, x: 0.06, y: -0.07},
            {t: 0.6, x: -0.07, y: 0.06},
            {t: 0.8, x: 0.07, y: -0.06},
            {t: 1.0, x: -0.06, y: 0.07},
            {t: 1.2, x: 0.08, y: -0.05},
            {t: 1.4, x: -0.05, y: 0.08},
            {t: 1.6, x: 0.06, y: -0.08},
            {t: 1.8, x: -0.08, y: 0.06},
            {t: 2.0, x: 0.07, y: -0.07},
            {t: 2.2, x: 0.05, y: -0.08}
        ]),
        track('JAW', [
            {t: 0, x: 0},
            {t: 0.15, x: 0.5},
            {t: 0.35, x: 0.08},
            {t: 0.55, x: 0.48},
            {t: 0.75, x: 0.1},
            {t: 0.95, x: 0.5},
            {t: 1.15, x: 0.09},
            {t: 1.35, x: 0.49},
            {t: 1.55, x: 0.1},
            {t: 1.75, x: 0.5},
            {t: 1.95, x: 0.09},
            {t: 2.2, x: 0}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // DANCE: Full-body groove
    // ============================================================
    clip('dance', 2.4, [
        track('HIP', [
            {t: 0, z: 0.2, y: 0.06},
            {t: 0.6, z: -0.2, y: 0.08},
            {t: 1.2, z: 0.2, y: 0.06},
            {t: 1.8, z: -0.2, y: 0.08},
            {t: 2.4, z: 0.2, y: 0.06}
        ]),
        track('SPINE1', [
            {t: 0, x: 0.08, z: -0.15},
            {t: 0.6, x: 0.1, z: 0.15},
            {t: 1.2, x: 0.08, z: -0.15},
            {t: 1.8, x: 0.1, z: 0.15},
            {t: 2.4, x: 0.08, z: -0.15}
        ]),
        track('L_THIGH', [
            {t: 0, x: 0.2},
            {t: 0.6, x: -0.3},
            {t: 1.2, x: 0.2},
            {t: 1.8, x: -0.3},
            {t: 2.4, x: 0.2}
        ]),
        track('R_THIGH', [
            {t: 0, x: -0.3},
            {t: 0.6, x: 0.2},
            {t: 1.2, x: -0.3},
            {t: 1.8, x: 0.2},
            {t: 2.4, x: -0.3}
        ]),
        track('L_UPPERARM', [
            {t: 0, x: -0.4, z: -1.2},
            {t: 0.6, x: 0.3, z: -1.1},
            {t: 1.2, x: -0.4, z: -1.2},
            {t: 1.8, x: 0.3, z: -1.1},
            {t: 2.4, x: -0.4, z: -1.2}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: 0.3, z: 1.1},
            {t: 0.6, x: -0.4, z: 1.2},
            {t: 1.2, x: 0.3, z: 1.1},
            {t: 1.8, x: -0.4, z: 1.2},
            {t: 2.4, x: 0.3, z: 1.1}
        ]),
        track('HEAD', [
            {t: 0, y: 0.1, z: -0.12},
            {t: 0.6, y: -0.08, z: 0.12},
            {t: 1.2, y: 0.1, z: -0.12},
            {t: 1.8, y: -0.08, z: 0.12},
            {t: 2.4, y: 0.1, z: -0.12}
        ])
    ]);

    // ============================================================
    // SIT: Bend at hips + lean forward
    // ============================================================
    clip('sit', 3.0, [
        track('L_THIGH', [
            {t: 0, x: 0.1},
            {t: 1.5, x: 1.3},
            {t: 3.0, x: 0.1}
        ]),
        track('R_THIGH', [
            {t: 0, x: 0.1},
            {t: 1.5, x: 1.3},
            {t: 3.0, x: 0.1}
        ]),
        track('L_CALF', [
            {t: 0, x: 0.05},
            {t: 1.5, x: -1.1},
            {t: 3.0, x: 0.05}
        ]),
        track('R_CALF', [
            {t: 0, x: 0.05},
            {t: 1.5, x: -1.1},
            {t: 3.0, x: 0.05}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 1.5, x: 0.4},
            {t: 3.0, x: -0.08}
        ]),
        track('HEAD', [
            {t: 0, y: 0.03},
            {t: 1.5, x: 0.15, y: -0.05},
            {t: 3.0, y: 0.03}
        ]),
        track('L_UPPERARM', [
            {t: 0, z: -1.57},
            {t: 3.0, z: -1.57}
        ]),
        track('R_UPPERARM', [
            {t: 0, z: 1.57},
            {t: 3.0, z: 1.57}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // STAND: Rise from sitting
    // ============================================================
    clip('stand', 3.0, [
        track('L_THIGH', [
            {t: 0, x: 1.3},
            {t: 1.5, x: 0.1},
            {t: 3.0, x: 0.1}
        ]),
        track('R_THIGH', [
            {t: 0, x: 1.3},
            {t: 1.5, x: 0.1},
            {t: 3.0, x: 0.1}
        ]),
        track('L_CALF', [
            {t: 0, x: -1.1},
            {t: 1.5, x: 0.05},
            {t: 3.0, x: 0.05}
        ]),
        track('R_CALF', [
            {t: 0, x: -1.1},
            {t: 1.5, x: 0.05},
            {t: 3.0, x: 0.05}
        ]),
        track('SPINE1', [
            {t: 0, x: 0.4},
            {t: 1.5, x: -0.08},
            {t: 3.0, x: -0.08}
        ]),
        track('HEAD', [
            {t: 0, x: 0.15, y: -0.05},
            {t: 1.5, y: 0.03},
            {t: 3.0, y: 0.03}
        ]),
        track('L_UPPERARM', [
            {t: 0, z: -1.57},
            {t: 3.0, z: -1.57}
        ]),
        track('R_UPPERARM', [
            {t: 0, z: 1.57},
            {t: 3.0, z: 1.57}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // JUMP: Full-body explosive motion
    // ============================================================
    clip('jump', 1.2, [
        track('L_THIGH', [
            {t: 0, x: -0.1},
            {t: 0.2, x: 0.8},
            {t: 0.4, x: 1.2},
            {t: 0.6, x: 0.3},
            {t: 0.8, x: -0.6},
            {t: 1.0, x: -0.3},
            {t: 1.2, x: -0.1}
        ]),
        track('R_THIGH', [
            {t: 0, x: -0.1},
            {t: 0.2, x: 0.8},
            {t: 0.4, x: 1.2},
            {t: 0.6, x: 0.3},
            {t: 0.8, x: -0.6},
            {t: 1.0, x: -0.3},
            {t: 1.2, x: -0.1}
        ]),
        track('L_CALF', [
            {t: 0, x: 0.1},
            {t: 0.2, x: 0.6},
            {t: 0.4, x: 1.3},
            {t: 0.6, x: 0.5},
            {t: 0.8, x: -0.3},
            {t: 1.0, x: 0.05},
            {t: 1.2, x: 0.1}
        ]),
        track('R_CALF', [
            {t: 0, x: 0.1},
            {t: 0.2, x: 0.6},
            {t: 0.4, x: 1.3},
            {t: 0.6, x: 0.5},
            {t: 0.8, x: -0.3},
            {t: 1.0, x: 0.05},
            {t: 1.2, x: 0.1}
        ]),
        track('L_UPPERARM', [
            {t: 0, x: 0.1, z: -1.57},
            {t: 0.4, x: -1.2, z: -1.2},
            {t: 0.8, x: 0.2, z: -1.57},
            {t: 1.2, x: 0.1, z: -1.57}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: -0.1, z: 1.57},
            {t: 0.4, x: 1.2, z: 1.2},
            {t: 0.8, x: -0.2, z: 1.57},
            {t: 1.2, x: -0.1, z: 1.57}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 0.4, x: -0.2},
            {t: 0.8, x: 0},
            {t: 1.2, x: -0.08}
        ])
    ], THREE.LoopOnce);

    // ============================================================
    // THINK: Hand on chin + contemplative sway
    // ============================================================
    clip('think', 3.2, [
        track('R_UPPERARM', [
            {t: 0, x: 0.2, z: 1.57},
            {t: 0.8, x: -0.6, z: 1.2},
            {t: 1.6, x: -0.5, z: 1.25},
            {t: 2.4, x: -0.6, z: 1.2},
            {t: 3.2, x: 0.2, z: 1.57}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.3},
            {t: 0.8, x: -1.0},
            {t: 1.6, x: -0.95},
            {t: 2.4, x: -1.0},
            {t: 3.2, x: -0.3}
        ]),
        track('HEAD', [
            {t: 0, y: 0.04},
            {t: 0.8, y: 0.12},
            {t: 1.6, y: 0.1},
            {t: 2.4, y: 0.11},
            {t: 3.2, y: 0.04}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 1.6, x: 0.03},
            {t: 3.2, x: -0.08}
        ]),
        track('L_UPPERARM', [
            {t: 0, z: -1.57},
            {t: 3.2, z: -1.57}
        ])
    ]);

    // ============================================================
    // WORK: Repetitive labor motion
    // ============================================================
    clip('work', 1.6, [
        track('SPINE1', [
            {t: 0, x: 0.05, z: 0},
            {t: 0.4, x: 0.2, z: -0.08},
            {t: 0.8, x: 0.08, z: 0},
            {t: 1.2, x: 0.18, z: 0.08},
            {t: 1.6, x: 0.05, z: 0}
        ]),
        track('L_UPPERARM', [
            {t: 0, x: 0.1, z: -1.57},
            {t: 0.4, x: -0.5, z: -1.4},
            {t: 0.8, x: 0.1, z: -1.57},
            {t: 1.2, x: -0.5, z: -1.4},
            {t: 1.6, x: 0.1, z: -1.57}
        ]),
        track('L_FOREARM', [
            {t: 0, x: 0.2},
            {t: 0.4, x: 0.9},
            {t: 0.8, x: 0.2},
            {t: 1.2, x: 0.9},
            {t: 1.6, x: 0.2}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: -0.1, z: 1.57},
            {t: 0.4, x: 0.5, z: 1.4},
            {t: 0.8, x: -0.1, z: 1.57},
            {t: 1.2, x: 0.5, z: 1.4},
            {t: 1.6, x: -0.1, z: 1.57}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.2},
            {t: 0.4, x: -0.9},
            {t: 0.8, x: -0.2},
            {t: 1.2, x: -0.9},
            {t: 1.6, x: -0.2}
        ])
    ]);

    // ============================================================
    // CARRY: Holding something in front
    // ============================================================
    clip('carry', 2.6, [
        track('L_UPPERARM', [
            {t: 0, x: -0.2, z: -1.3},
            {t: 1.3, x: -0.3, z: -1.25},
            {t: 2.6, x: -0.2, z: -1.3}
        ]),
        track('L_FOREARM', [
            {t: 0, x: 0.4},
            {t: 1.3, x: 0.5},
            {t: 2.6, x: 0.4}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: 0.2, z: 1.3},
            {t: 1.3, x: 0.3, z: 1.25},
            {t: 2.6, x: 0.2, z: 1.3}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.4},
            {t: 1.3, x: -0.5},
            {t: 2.6, x: -0.4}
        ]),
        track('SPINE1', [
            {t: 0, x: -0.08},
            {t: 1.3, x: -0.05},
            {t: 2.6, x: -0.08}
        ]),
        track('HEAD', [
            {t: 0, y: 0.03},
            {t: 1.3, y: 0.02},
            {t: 2.6, y: 0.03}
        ])
    ]);

    // ============================================================
    // SLEEP: Full body relaxation
    // ============================================================
    clip('sleep', 4.0, [
        track('SPINE1', [
            {t: 0, x: 0.25},
            {t: 2.0, x: 0.3},
            {t: 4.0, x: 0.25}
        ]),
        track('HEAD', [
            {t: 0, x: 0.2, y: -0.1},
            {t: 2.0, x: 0.25, y: -0.12},
            {t: 4.0, x: 0.2, y: -0.1}
        ]),
        track('NECK', [
            {t: 0, x: 0.15},
            {t: 2.0, x: 0.2},
            {t: 4.0, x: 0.15}
        ]),
        track('L_UPPERARM', [
            {t: 0, x: 0.4, z: -1.4},
            {t: 2.0, x: 0.5, z: -1.35},
            {t: 4.0, x: 0.4, z: -1.4}
        ]),
        track('L_FOREARM', [
            {t: 0, x: 0.7},
            {t: 2.0, x: 0.8},
            {t: 4.0, x: 0.7}
        ]),
        track('R_UPPERARM', [
            {t: 0, x: -0.4, z: 1.4},
            {t: 2.0, x: -0.5, z: 1.35},
            {t: 4.0, x: -0.4, z: 1.4}
        ]),
        track('R_FOREARM', [
            {t: 0, x: -0.7},
            {t: 2.0, x: -0.8},
            {t: 4.0, x: -0.7}
        ]),
        track('L_THIGH', [
            {t: 0, x: 0.15},
            {t: 2.0, x: 0.2},
            {t: 4.0, x: 0.15}
        ]),
        track('R_THIGH', [
            {t: 0, x: 0.15},
            {t: 2.0, x: 0.2},
            {t: 4.0, x: 0.15}
        ]),
        track('HIP', [
            {t: 0, y: -0.08},
            {t: 2.0, y: -0.1},
            {t: 4.0, y: -0.08}
        ])
    ], THREE.LoopRepeat);
}
